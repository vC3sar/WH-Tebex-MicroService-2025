const express = require('express');
const router = express.Router();
const colors = require('colors');
const { debug, api } = require('./../config.json');
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

const allowedWebhookIps = new Set(['18.209.80.3', '54.87.231.232', '::ffff:127.0.0.1', '127.0.0.1']);

function normalizeIp(ip) {
  return String(ip || '').replace(/^::ffff:/, '');
}

function getClientIP(req) {
  return normalizeIp(req.headers['cf-connecting-ip'] || req.socket.remoteAddress);
}

router.use('/', function (req, res, next) {
  if (req.path === '/favicon.ico' && api?.favicon_url) {
    return res.redirect(api.favicon_url);
  }

  const ip = getClientIP(req);
  logger.info('Request received from: ' + ip);

  if (debug) {
    console.log(colors.gray(`Nueva venta, debug mode on || from: ${ip}`));
  }

  if (allowedWebhookIps.has(ip)) {
    next();
    return;
  }

  console.log(colors.red(`Bad Request from: ${ip}`));
  return res.status(403).json({ error: 'Not authorized' });
});

module.exports = router;
