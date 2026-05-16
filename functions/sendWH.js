const logger = require("../lib/logger.js");

function normalizeFooterUrl(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return String(value).replace(/^https?:\/\//, '');
  }
}

function buildCommonEmbed(EmbedBuilder, { color, url, gifurl, imageurl, title, description, footerText }) {
  const embed = new EmbedBuilder();
  embed.setColor(color);
  if (url) embed.setURL(url);
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (gifurl) embed.setThumbnail(gifurl);
  if (imageurl) embed.setImage(imageurl);
  if (footerText) embed.setFooter({ text: footerText });
  embed.setTimestamp();
  return embed;
}

async function sendWH(
  longitud,
  username,
  product,
  price,
  channel,
  url,
  url_infooter,
  color,
  emojititle,
  emojireact,
  gifurl,
  imageurl,
  conf,
  EmbedBuilder,
  requestId
) {
  try {
    if (!channel || typeof channel.send !== 'function') {
      throw new Error('Discord channel is not available');
    }

    const embed = buildCommonEmbed(EmbedBuilder, {
      color,
      url,
      gifurl,
      imageurl,
      title: ` ${emojititle} **${conf.sales.message}**`,
      footerText: url_infooter ? `${conf.footer.text} ${normalizeFooterUrl(url)}` : conf.footer.text,
    });

    const parsedPrice = Number.parseFloat(price);
    embed.addFields({ name: conf.fields.name, value: username, inline: true });

    if (Number.isFinite(parsedPrice) && parsedPrice > 0.1) {
      embed.addFields({ name: conf.fields.valuetotal, value: price, inline: true });
    } else {
      embed.addFields({ name: conf.fields.valuetotal, value: conf.fields.getbygiftcard, inline: true });
    }

    embed.addFields({
      name: longitud > 1 ? conf.fields.packages : conf.fields.package,
      value: product,
      inline: false,
    });

    const message = await channel.send({ embeds: [embed] });
    await message.react(emojireact).catch((reactionError) => {
      logger.warn(`Could not react to Discord message: ${reactionError.message}`, { requestId });
    });
  } catch (err) {
    logger.error(`Error sending webhook embed: ${err.stack || err.message}`, { requestId });
    console.error(err);
  }
}

async function sendErrorWH({
  channel,
  EmbedBuilder,
  requestId,
  url,
  color = "#ff3b3b",
  gifurl,
  imageurl,
  title = "Webhook inválido",
  description = "La solicitud llegó sin productos válidos. Revisa el payload y vuelve a intentarlo.",
  footerText = "WH-Tebex MicroService",
}) {
  try {
    if (!channel || typeof channel.send !== 'function') {
      throw new Error('Discord channel is not available');
    }

    const embed = buildCommonEmbed(EmbedBuilder, {
      color,
      url,
      gifurl,
      imageurl,
      title,
      description,
      footerText: requestId ? `${footerText} • ${requestId}` : footerText,
    });

    await channel.send({ embeds: [embed] });
  } catch (err) {
    logger.error(`Error sending error embed: ${err.stack || err.message}`, { requestId });
    console.error(err);
  }
}

module.exports = {
  sendErrorWH,
  sendWH,
};
