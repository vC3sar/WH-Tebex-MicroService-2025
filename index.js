const fs = require("fs");
const { randomUUID } = require("crypto");
const colors = require("colors");
const {
  debug,
  defPort,
  embed,
  tebexCheck,
  token,
  shopchannelID,
  language,
  showServer,
} = require("./config.json");
const type_req = require("./handlers/type_request.js");
const validfrom = require("./handlers/from.js");
const { autoTranslate } = require("./functions/translate.js");
const { createFeatures } = require("./functions/create_features.js");
const { sendErrorWH, sendWH } = require("./functions/sendWH.js");
const {
  printAvailableLanguages,
  printStartupSummary,
  validateRuntimeConfig,
} = require("./lib/check.js");
const logger = require("./lib/logger.js");
const { incrementMetric, metrics } = require("./lib/metrics.js");
const { getWebhookEventId, claimEvent, pruneStore } = require("./lib/idempotency.js");
const {
  getCommandPrefix,
  handleTebexCheckCommand,
  handleTebexInteraction,
  handleTebexUserCommand,
} = require("./functions/tebex_commands.js");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const express = require("express");
const ip = require("ip").address();
const configTebexCheck = tebexCheck || {};

if (embed.useMCskin === undefined) {
  createFeatures();
  embed.useMCskin = true;
}

const emojititle = embed.emojititle;
const emojireact = embed.emojireact;
const emojicurrency = embed.emojicurrency;
const gifurl = embed.gifurl;
const imageurl = embed.imageurl;
const url = embed.url;
const url_infooter = embed.url_infooter;
const color = embed.color;
const emojiproductArrow = embed.emojiproductArrow;
const discordJsVersion = require("./package.json").dependencies["discord.js"].replace("^", "");

try {
  validateRuntimeConfig({
    token,
    shopchannelID,
    url,
    defPort,
    emojititle,
    emojireact,
    emojicurrency,
    gifurl,
    language,
    url_infooter,
  });
} catch (err) {
  logger.error(err.message);
  console.error(colors.red(`BOOT config error: ${err.message}`));
  if (String(err.message).includes('language')) {
    printAvailableLanguages();
  }
  process.exit(1);
}

let conf;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

if (debug === true) {
  logger.info("debug mode enabled");
}

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) {
    return;
  }

  if (debug === true) {
    logger.info(`chat author=${message.author.username} content=${message.content}`);
  }

  const prefix = getCommandPrefix({ tebexCheck: configTebexCheck });
  if (!message.content.startsWith(prefix)) {
    return;
  }

  const [command, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
  if (!command) {
    return;
  }

  try {
    if (command.toLowerCase() === "tbxuser") {
      await handleTebexUserCommand(message, args, { tebexCheck: configTebexCheck });
      return;
    }

    if (command.toLowerCase() === "tbxcheck") {
      await handleTebexCheckCommand(message, args, { tebexCheck: configTebexCheck });
    }
  } catch (err) {
    logger.error(err.stack || err.message);
    await message.reply("Ocurrió un error al procesar el comando.");
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    await handleTebexInteraction(interaction, { tebexCheck: configTebexCheck });
  } catch (err) {
    logger.error(err.stack || err.message);
    if (interaction.isRepliable()) {
      const payload = { content: "No se pudo procesar la interacción.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  }
});

async function initializeLanguage() {
  if (fs.existsSync(`./langs/${language}.json`)) {
    conf = require(`./langs/${language}.json`);
    return;
  }

  await autoTranslate("./langs/spanish.json", language);
  conf = require(`./langs/${language}.json`);
  console.log(colors.yellow(`BOOT language generated: ${language}`));
}

async function start() {
  try {
    await initializeLanguage();
    pruneStore();
  } catch (err) {
    logger.error(err.stack || err.message);
    console.error(colors.red(`BOOT language setup failed: ${err.message}`));
    process.exit(1);
  }

  client.once("clientReady", () => {
  printStartupSummary({
    language,
    defPort,
    discordJsVersion,
    debug,
    useMCskin: embed.useMCskin === true || embed.useMCskin === "true",
    showServer,
  });

  const app = express();
  const port = process.env.PORT || defPort;

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    incrementMetric("requests_total");
    logger.info(`${req.method} ${req.originalUrl}`, { requestId });
    next();
  });
  app.use(express.json({ limit: "1mb" }), type_req, validfrom);
  app.use(express.urlencoded({ extended: true }));

  app.get("/healthz", (_req, res) => {
    res.status(200).json({
      ok: true,
      language: conf ? language : null,
      uptime_seconds: Math.round(process.uptime()),
      request_count: metrics.requests_total,
    });
  });

  app.get("/metrics", (_req, res) => {
    res.status(200).json({
      ...metrics,
      uptime_seconds: Math.round(process.uptime()),
    });
  });

  app.post("/", async (req, res) => {
    const requestId = req.requestId;

    try {
      const products = req.body?.subject?.products;
      const channel = client.channels.cache.get(shopchannelID) || (await client.channels.fetch(shopchannelID).catch(() => null));
      const eventId = getWebhookEventId(req.body);

      if (!Array.isArray(products) || products.length === 0) {
        incrementMetric("webhook_empty_products_total");
        logger.warn("webhook payload missing products", { requestId });
        await sendErrorWH({
          channel,
          EmbedBuilder,
          requestId,
          url,
          gifurl,
          imageurl,
          title: "Webhook sin productos",
          description: "La solicitud llegó correctamente, pero no contenía productos válidos para publicar.",
          footerText: "WH-Tebex MicroService",
        });
        return res.status(400).json({ error: "Webhook payload is missing products", requestId });
      }

      if (debug === true) {
        logger.info("debug mode bypassed duplicate check", { requestId, eventId });
      } else if (eventId) {
        if (!claimEvent(eventId)) {
          incrementMetric("webhook_duplicates_total");
          logger.info(`duplicate webhook skipped eventId=${eventId}`, { requestId });
          return res.status(200).json({ ok: true, duplicate: true, requestId, eventId });
        }
      } else {
        logger.warn("webhook missing dedupe id", { requestId });
      }

      const customerName = req.body?.subject?.customer?.username?.username || "unknown";
      const priceAmount = req.body?.subject?.price?.amount;
      const priceCurrency = req.body?.subject?.price?.currency || "";
      const summary = buildProductSummary(products);
      const useMCskin = embed.useMCskin === true || embed.useMCskin === "true";
      const avatarUrl = useMCskin ? `https://mc-heads.net/avatar/${customerName}` : gifurl;
      const totalPrice = `${formatAmount(priceAmount)} **${priceCurrency}** ${emojicurrency}`;

      if (!channel) {
        throw new Error("Discord channel could not be resolved");
      }

      if (debug === true && conf?.messages?.getchannel) {
        logger.info(`${conf.messages.getchannel} ${shopchannelID}`, { requestId });
      }

      await sendWH(
        products.length,
        customerName,
        summary,
        totalPrice,
        channel,
        url,
        url_infooter,
        color,
        emojititle,
        emojireact,
        avatarUrl,
        imageurl,
        conf,
        EmbedBuilder,
        requestId
      );

      incrementMetric("webhook_accepts_total");
      return res.status(200).json({ ok: true, requestId });
    } catch (err) {
      incrementMetric("webhook_errors_total");
      logger.error(err.stack || err.message, { requestId });
      console.error(colors.red(`ERROR [${requestId}]: ${err.message}`));
      return res.status(500).json({ error: "Internal server error", requestId });
    }
  });

  app.listen(port, () => {
    logger.info(`HTTP server listening on ${port}`);
    console.log(colors.green(`BOOT http ${ip}:${port}`));
  });
  });

  client.login(token).catch((err) => {
    logger.error(err.stack || err.message);
    console.error(colors.red(`BOOT discord login failed: ${err.message}`));
    process.exit(1);
  });
}

start();

function buildProductSummary(products) {
  return products
    .map((product) => {
      const baseLine = `${emojiproductArrow}${product.name} **x${product.quantity}** **|** $${formatAmount(product.paid_price?.amount)}`;

      if (showServer === false) {
        return baseLine;
      }

      const servers =
        (product.servers || []).map((server) => server.name).filter(Boolean).join("\n") || "n/a";

      return `${baseLine}\n${conf?.messages?.servidor || "Servidor"}: ${servers}`;
    })
    .join("\n");
}

function formatAmount(amount) {
  const numericAmount = Number.parseFloat(amount);
  return Number.isFinite(numericAmount) ? numericAmount.toFixed(2) : "0.00";
}
