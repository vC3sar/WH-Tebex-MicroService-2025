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
async function sendWH(longitud, username, product, price, channel, url, url_infooter, color, emojititle, emojireact, gifurl, imageurl, conf, EmbedBuilder) {
  try {
    console.log(product);
    // Create the embed message
    const MSG = new EmbedBuilder();
    MSG.setColor(color);
    MSG.setURL(url);
    ///////EMBED TITLE, IMAGE, FIELDS ////////
    MSG.setTitle(` ${emojititle} **${conf.sales.message}**`);
    MSG.setThumbnail(gifurl);
    MSG.setImage(imageurl);
    MSG.addFields({ name: conf.fields.name, value: username, inline: true });
    ////////EMBED PRICE SELL////////
    if (parseInt(price) > 0.1) {
      MSG.addFields({ name: conf.fields.valuetotal, value: price, inline: true });
    } else { MSG.addFields({ name: conf.fields.valuetotal, value: conf.fields.getbygiftcard, inline: true }); }
    if (longitud > 1) {
      MSG.addFields({ name: conf.fields.packages, value: product, inline: false });
    } else { MSG.addFields({ name: conf.fields.package, value: product, inline: false }); }
    ////////////////////////////////
    // Timestamp and Footer
    MSG.setTimestamp();
    // Footer with or without URL
    if (url_infooter == true) {
      MSG.setFooter({ text: `${conf.footer.text} ${url.replace('https://', '').replace('http://', '')}` });
    } else { MSG.setFooter({ text: conf.footer.text }); }
    // Send the embed to the channel
    channel
      .send({ embeds: [MSG] })
      .then(function (message) { message.react(emojireact); })
      .catch(function () { 
        logger.info('Error: ' + err)
        console.log(err);
       });
  } catch (err) {
    logger.info('Error: ' + err)
    console.log(err);
  }

}

module.exports.sendWH = sendWH;