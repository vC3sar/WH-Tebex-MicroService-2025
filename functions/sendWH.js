const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File({ filename: 'app.log', level: 'info' }),
    new winston.transports.Console()
  ]
});

function normalizeFooterUrl(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return String(value).replace(/^https?:\/\//, '');
  }
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
  EmbedBuilder
) {
  try {
    if (!channel || typeof channel.send !== 'function') {
      throw new Error('Discord channel is not available');
    }

    const embed = new EmbedBuilder();
    const parsedPrice = Number.parseFloat(price);

    embed.setColor(color);
    embed.setURL(url);
    embed.setTitle(` ${emojititle} **${conf.sales.message}**`);
    embed.setThumbnail(gifurl);
    embed.setImage(imageurl);
    embed.addFields({ name: conf.fields.name, value: username, inline: true });

    if (Number.isFinite(parsedPrice) && parsedPrice > 0.1) {
      embed.addFields({ name: conf.fields.valuetotal, value: price, inline: true });
    } else {
      embed.addFields({ name: conf.fields.valuetotal, value: conf.fields.getbygiftcard, inline: true });
    }

    embed.addFields({
      name: longitud > 1 ? conf.fields.packages : conf.fields.package,
      value: product,
      inline: false
    });

    embed.setTimestamp();
    embed.setFooter({
      text: url_infooter ? `${conf.footer.text} ${normalizeFooterUrl(url)}` : conf.footer.text
    });

    const message = await channel.send({ embeds: [embed] });
    await message.react(emojireact).catch((reactionError) => {
      logger.warn(`Could not react to Discord message: ${reactionError.message}`);
    });
  } catch (err) {
    logger.error(`Error sending webhook embed: ${err.stack || err.message}`);
    console.error(err);
  }
}

module.exports.sendWH = sendWH;
