const fs = require('fs');
var colors = require('colors');
const winston = require('winston');
const { debug, shopchannelID2, defPort, embed, token, shopchannelID, language, showServer } = require("./config.json");
const type_req = require('./handlers/type_request.js');
const validfrom = require('./handlers/from.js');
const { autoTranslate } = require('./functions/translate.js');
const { createFeatures } = require('./functions/create_features.js');
//// LOGS SYSTEM ////
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.File({ filename: 'app.log', level: 'info' }), new winston.transports.Console()]
});

if (embed.useMCskin === undefined) createFeatures();
///////////////////////////////
//   Embed Configurations    //
var emojititle = embed.emojititle; var emojireact = embed.emojireact;
var emojicurrency = embed.emojicurrency; var gifurl = embed.gifurl; var imageurl = embed.imageurl;
var url = embed.url; var url_infooter = embed.url_infooter;
var color = embed.color; var emojiproductArrow = embed.emojiproductArrow;
///////////////////////////////
var conf;
const ll = require('./lib/check.js');
ll.cc(debug, defPort, emojititle, emojireact, emojicurrency, token, shopchannelID, language, gifurl, url, url_infooter);
const express = require('express');
var status = 0;
if (fs.existsSync('./langs/' + language + '.json')) {
  console.log(`${colors.cyan(`language loaded: ${language}`)}`);
  conf = require('./langs/' + language + '.json');
} else { autoTranslate(require('./langs/spanish.json'), language); status = 1; }

///////////////////////////////
// Defined Discord Functions //
///////////////////////////////
const {
  Client,
  Events,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
///////////////////////////////
//          Debug mode       
// shopchannelID2 is for testings or debugs
if (debug == true) {
  console.log(colors.gray('Debug mode is enabled!'));
  client.on('messageCreate', message => {
    if (message.author.bot) return;
    console.log(`${message.author.username}: ${message.content}`)
  });
}
///////////////////////////////

/////////EMBED///////////
const { sendWH } = require('./functions/sendWH.js');
////////////////////////

////////PROCESS///////////
client.on('ready', () => {
  console.log(colors.yellow('2. Started... '));
  console.log(colors.green(`3. Logged in as ${client.user.tag}!`));
  console.log(colors.yellow('4. Running on ') + colors.green('discord.js v' + require('./package.json').dependencies['discord.js'].replace('^', '')));
  const app = express();
  const port = process.env.PORT || defPort;
  app.use(express.json(), type_req, validfrom);
  app.use(express.urlencoded({ extended: true }));

  app.post('/', async function (req, res) {
    try {
      // Process the request
      const products = req.body.subject.products;
      const temp = "";
      if (showServer = false) { 
        temp = products.map((product) => `${emojiproductArrow}${product.name} **x${product.quantity}** **|** $${product.paid_price.amount.toFixed(2)}`).join('\n'); 
      } else{
        temp = products.map((product) => { 
        const servers = (product.servers || []).map((server) => server.name).join('\n') || 'Ninguno'; 
        return `${emojiproductArrow}${product.name}**x${product.quantity}** **|** $${product.paid_price.amount.toFixed(2)}\n${conf.messages.servidor}: ${servers}`;
      }).join('\n');
      }
      const totalPrice = `${req.body.subject.price.amount.toFixed(2)} **${req.body.subject.price.currency}** ${emojicurrency}`;
      const channel = client.channels.cache.get(shopchannelID);
      if (debug == true) console.log(`${conf.messages.getchannel} ${channel}`);
      // Send message with function
      var name = req.body.subject.customer.username.username;
      var prodl = products.length;
      console.log(embed.useMCskin)
      if (embed.useMCskin || embed.useMCskin == 'true') gifurl = 'https://mc-heads.net/avatar/' + name;
      await sendWH(prodl, name, temp, totalPrice, channel, url, url_infooter, color, emojititle, emojireact, gifurl, imageurl, conf, EmbedBuilder);
      // Send response to the request
      res.status(200).json(req.body);
    } catch (err) {
      console.log(colors.red(`ERROR: ${err}`));
      await logger.info('server-error.log', `${err}\r\n`);
    }
  });

  app.listen(port);
  console.log(`${colors.yellow('5. Running on ')} ${colors.green('server port ' + port)}`);
  logger.info('App its works.');
});
if (status == 0) { client.login(token); } else { console.log(colors.red('ENGINE: The discord bot and web server will not start because the integration language is being processed.')); }
