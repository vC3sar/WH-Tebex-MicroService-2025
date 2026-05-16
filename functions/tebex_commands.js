const { randomUUID } = require("crypto");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const logger = require("../lib/logger.js");

const DEFAULT_PAGE_SIZE = 5;
const sessions = new Map();
const tebexApiBase = "https://plugin.tebex.io";

async function tebexRequest(pathname, apiKey) {
  const response = await fetch(`${tebexApiBase}${pathname}`, {
    headers: {
      "X-Tebex-Secret": apiKey,
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    data,
    ok: response.ok,
    status: response.status,
  };
}

function normalizeRequiredRole(config) {
  return config?.tebexCheck?.requiredRole || "";
}

function normalizeApiKey(config) {
  return config?.tebexCheck?.apiKey || "";
}

function normalizePrefix(config) {
  return config?.tebexCheck?.prefix || "!";
}

function hasRequiredRole(member, requiredRole) {
  if (!requiredRole) {
    return true;
  }

  return Boolean(member?.roles?.cache?.has(requiredRole));
}

function formatCurrencyValue(currency, amount) {
  if (amount === undefined || amount === null || amount === "") {
    return "0.00";
  }

  const numericAmount = Number.parseFloat(amount);
  const formattedAmount = Number.isFinite(numericAmount) ? numericAmount.toFixed(2) : String(amount);
  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}

function formatTimestamp(seconds) {
  if (!seconds) {
    return "Desconocida";
  }

  return `<t:${seconds}:F>`;
}

function formatPaymentStatus(status) {
  if (typeof status === "number") {
    return status === 1 ? "Aprobado" : "Rechazado";
  }

  if (typeof status === "string") {
    return status;
  }

  return "Desconocido";
}

function splitPages(items, pageSize) {
  const pages = [];

  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }

  return pages;
}

function truncateText(value, limit = 1024) {
  const text = String(value ?? "");
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit - 3)}...`;
}

function buildPaymentSummaryLine(payment) {
  const paymentId = payment.txn_id || payment.id || "unknown";
  const amount = formatCurrencyValue(payment.currency, payment.price);
  const status = formatPaymentStatus(payment.status);
  const date = formatTimestamp(payment.time);

  return `**${paymentId}** • ${amount} • ${status} • ${date}`;
}

function buildPaymentsSelectOptions(payments) {
  return payments.slice(0, 25).map((payment) => {
    const paymentId = String(payment.txn_id || payment.id || "unknown");
    return {
      label: paymentId.slice(0, 100),
      description: truncateText(`${formatCurrencyValue(payment.currency, payment.price)} • ${formatPaymentStatus(payment.status)}`, 100),
      value: paymentId,
    };
  });
}

function buildUserView(session) {
  const pageSize = session.pageSize || DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(splitPages(session.payments, pageSize).length, 1);
  const currentPage = Math.min(Math.max(session.page || 0, 0), pageCount - 1);
  const currentPayments = splitPages(session.payments, pageSize)[currentPage] || [];
  const purchaseTotals = session.userData.purchaseTotals || {};
  const totalSpentSummary = Object.entries(purchaseTotals)
    .map(([currency, amount]) => `${currency}: ${formatCurrencyValue(currency, amount)}`)
    .join(" • ") || "Desconocido";

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle(`Tebex user: ${session.userData.player?.username || "Desconocido"}`)
    .setDescription("Usa los botones para cambiar de página y el selector para abrir un pago.")
    .addFields(
      { name: "Tebex ID", value: String(session.userData.player?.id || "Desconocido"), inline: true },
      { name: "Plugin ID", value: String(session.userData.player?.plugin_username_id || "Desconocido"), inline: true },
      { name: "Baneos", value: String(session.userData.banCount ?? 0), inline: true },
      { name: "Chargeback rate", value: String(session.userData.chargebackRate ?? 0), inline: true },
      { name: "Pagos", value: String(session.payments.length), inline: true },
      { name: "Total comprado", value: totalSpentSummary, inline: true },
    )
    .setFooter({ text: `Página ${currentPage + 1}/${pageCount}` })
    .setTimestamp();

  const paymentLines = currentPayments.length
    ? currentPayments.map((payment, index) => `${currentPage * pageSize + index + 1}. ${buildPaymentSummaryLine(payment)}`).join("\n")
    : "Sin pagos en esta página.";

  embed.addFields({
    name: "Pagos recientes",
    value: truncateText(paymentLines, 1024),
    inline: false,
  });

  const components = [];

  if (session.payments.length > 0) {
    const navRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`tbxuser:prev:${session.sessionId}`)
        .setLabel("Anterior")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 0),
      new ButtonBuilder()
        .setCustomId(`tbxuser:next:${session.sessionId}`)
        .setLabel("Siguiente")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= pageCount - 1),
    );

    components.push(navRow);

    const selectOptions = buildPaymentsSelectOptions(currentPayments);
    if (selectOptions.length > 0) {
      components.push(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`tbxuser:select:${session.sessionId}`)
            .setPlaceholder("Selecciona un pago")
            .addOptions(selectOptions)
        )
      );
    }
  }

  return {
    components,
    currentPage,
    embed,
    pageCount,
    currentPayments,
  };
}

async function buildPaymentEmbed(txnId, apiKey) {
  const paymentResponse = await tebexRequest(`/payments/${encodeURIComponent(txnId)}`, apiKey);

  if (!paymentResponse.ok) {
    return null;
  }

  const payment = paymentResponse.data || {};
  const packages = Array.isArray(payment.packages) ? payment.packages : [];
  const packageLines = packages.length
    ? packages.map((pkg) => `**${pkg.name || "Sin nombre"}** (ID: ${pkg.id || "?"})`).join("\n")
    : "Sin paquetes.";

  return new EmbedBuilder()
    .setColor("#00b894")
    .setTitle(`Pago Tebex: ${payment.id || txnId}`)
    .addFields(
      { name: "Estado", value: String(payment.status || "Desconocido"), inline: true },
      { name: "Jugador", value: String(payment.player?.name || payment.player?.username || "Desconocido"), inline: true },
      { name: "Monto", value: String(payment.amount ?? "0"), inline: true },
      { name: "Fecha", value: payment.date ? `<t:${Math.floor(new Date(payment.date).getTime() / 1000)}:F>` : "Desconocida", inline: true },
      { name: "Email", value: String(payment.email || "N/A"), inline: false },
      { name: "Paquetes", value: truncateText(packageLines, 1024), inline: false },
    )
    .setTimestamp();
}

async function handleTebexUserCommand(message, args, config) {
  const apiKey = normalizeApiKey(config);
  const requiredRole = normalizeRequiredRole(config);

  if (!apiKey) {
    await message.reply("Falta configurar `tebexCheck.apiKey`.");
    return;
  }

  if (!hasRequiredRole(message.member, requiredRole)) {
    await message.reply("No tienes permiso para usar este comando.");
    return;
  }

  const query = args.join(" ").trim();
  if (!query) {
    await message.reply("Uso: `!tbxuser <nick|uuid>`");
    return;
  }

  const response = await tebexRequest(`/user/${encodeURIComponent(query)}`, apiKey);
  if (!response.ok || !response.data?.player) {
    await message.reply("No encontré ese usuario en Tebex.");
    return;
  }

  const sessionId = randomUUID();
  const session = {
    authorId: message.author.id,
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    payments: Array.isArray(response.data.payments) ? response.data.payments : [],
    sessionId,
    userData: response.data,
  };

  sessions.set(sessionId, session);
  const { embed, components } = buildUserView(session);

  const reply = await message.reply({
    allowedMentions: { repliedUser: false },
    components,
    embeds: [embed],
  });

  session.messageId = reply.id;
}

async function handleTebexCheckCommand(message, args, config) {
  const apiKey = normalizeApiKey(config);
  const requiredRole = normalizeRequiredRole(config);

  if (!apiKey) {
    await message.reply("Falta configurar `tebexCheck.apiKey`.");
    return;
  }

  if (!hasRequiredRole(message.member, requiredRole)) {
    await message.reply("No tienes permiso para usar este comando.");
    return;
  }

  const txnId = args.join(" ").trim();
  if (!txnId) {
    await message.reply("Uso: `!tbxcheck <tbx-id>`");
    return;
  }

  const embed = await buildPaymentEmbed(txnId, apiKey);
  if (!embed) {
    await message.reply("No encontré ese pago en Tebex.");
    return;
  }

  await message.reply({
    allowedMentions: { repliedUser: false },
    embeds: [embed],
  });
}

async function handleTebexInteraction(interaction, config) {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) {
    return false;
  }

  const [scope, action, sessionId] = interaction.customId.split(":");
  if (scope !== "tbxuser" || !sessionId) {
    return false;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    await interaction.reply({ content: "Esta sesión expiró.", ephemeral: true });
    return true;
  }

  if (interaction.user.id !== session.authorId) {
    await interaction.reply({ content: "Solo el autor del comando puede usar estos controles.", ephemeral: true });
    return true;
  }

  if (interaction.isButton()) {
    const nextPage = action === "next" ? session.page + 1 : session.page - 1;
    const pageCount = Math.max(splitPages(session.payments, session.pageSize).length, 1);
    session.page = Math.min(Math.max(nextPage, 0), pageCount - 1);
    const { embed, components } = buildUserView(session);
    await interaction.update({ components, embeds: [embed] });
    return true;
  }

  if (interaction.isStringSelectMenu()) {
    const selectedTxnId = interaction.values[0];
    const apiKey = normalizeApiKey(config);
    const embed = await buildPaymentEmbed(selectedTxnId, apiKey);

    if (!embed) {
      await interaction.reply({ content: "No encontré ese pago en Tebex.", ephemeral: true });
      return true;
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
    return true;
  }

  return false;
}

function getCommandPrefix(config) {
  return normalizePrefix(config);
}

module.exports = {
  getCommandPrefix,
  handleTebexCheckCommand,
  handleTebexInteraction,
  handleTebexUserCommand,
  tebexRequest,
};
