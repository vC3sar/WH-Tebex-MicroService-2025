const fs = require("fs");
const colors = require("colors");
const winston = require("winston");
const {
  debug,
  defPort,
  embed,
  token,
  shopchannelID,
  language,
  showServer,
} = require("./config.json");
const type_req = require("./handlers/type_request.js");
const validfrom = require("./handlers/from.js");
const { autoTranslate } = require("./functions/translate.js");
const { createFeatures } = require("./functions/create_features.js");
const { sendWH } = require("./functions/sendWH.js");
const { cc } = require("./lib/check.js");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const express = require("express");
const ip = require("ip").address();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File({ filename: "app.log", level: "info" }),
    new winston.transports.Console(),
  ],
});

if (embed.useMCskin === undefined) createFeatures();

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

let conf;
cc(
  debug,
  defPort,
  emojititle,
  emojireact,
  emojicurrency,
  token,
  shopchannelID,
  language,
  gifurl,
  url,
  url_infooter
);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

if (debug === true) {
  console.log(colors.gray("Debug mode is enabled!"));
  client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    console.log(`CHAT: ${message.author.username} : ${colors.white(message.content)}`);
  });
}

if (fs.existsSync(`./langs/${language}.json`)) {
  console.log(colors.cyan(`language loaded: ${language}`));
  conf = require(`./langs/${language}.json`);
} else {
  console.log(colors.bgRed("Restart the bot to apply changes"));
  void autoTranslate("./langs/spanish.json", language).catch((err) => {
    logger.error(err.stack || err.message);
    console.error(colors.red(`Language generation failed: ${err.message}`));
  });
}

client.once("ready", () => {
  console.log(colors.yellow("2. Started... "));
  console.log(colors.green(`3. Logged in as ${client.user.tag}!`));
  console.log(colors.yellow("4. Running on ") + colors.green(`discord.js v${discordJsVersion}`));

  const app = express();
  const port = process.env.PORT || defPort;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }), type_req, validfrom);
  app.use(express.urlencoded({ extended: true }));
  app.get("/healthz", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.post("/", async (req, res) => {
    try {
      const products = req.body?.subject?.products;
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error("Webhook payload is missing products");
      }

      const customerName = req.body?.subject?.customer?.username?.username || "unknown";
      const priceAmount = req.body?.subject?.price?.amount;
      const priceCurrency = req.body?.subject?.price?.currency || "";
      const channel = client.channels.cache.get(shopchannelID) || (await client.channels.fetch(shopchannelID).catch(() => null));

      if (debug === true) {
        console.log(`${conf.messages.getchannel} ${channel}`);
      }

      const summary = buildProductSummary(products);
      const useMCskin = embed.useMCskin === true || embed.useMCskin === "true";
      const avatarUrl = useMCskin ? `https://mc-heads.net/avatar/${customerName}` : gifurl;
      const totalPrice = `${formatAmount(priceAmount)} **${priceCurrency}** ${emojicurrency}`;

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
        EmbedBuilder
      );

      res.status(200).json(req.body);
    } catch (err) {
      logger.error(err.stack || err.message);
      console.log(colors.red(`ERROR: ${err.message}`));
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.listen(port, () => {
    console.log(`${colors.yellow("5. Running on ")} ${colors.green(` ${ip}:${port} `)}`);
    logger.info("App is running.");
  });
});

if (fs.existsSync(`./langs/${language}.json`)) {
  client.login(token).catch((err) => {
    logger.error(err.stack || err.message);
    console.error(colors.red(`Discord login failed: ${err.message}`));
  });
} else {
  console.log(
    colors.red(
      "ENGINE: The discord bot and web server will not start because the integration language is being processed."
    )
  );
}

function buildProductSummary(products) {
  return products
    .map((product) => {
      const baseLine = `${emojiproductArrow}${product.name} **x${product.quantity}** **|** $${formatAmount(product.paid_price?.amount)}`;

      if (showServer === false) {
        return baseLine;
      }

      const servers =
        (product.servers || []).map((server) => server.name).filter(Boolean).join("\n") || "n/a";

      return `${baseLine}\n${conf.messages.servidor}: ${servers}`;
    })
    .join("\n");
}

function formatAmount(amount) {
  const numericAmount = Number.parseFloat(amount);
  return Number.isFinite(numericAmount) ? numericAmount.toFixed(2) : "0.00";
}
