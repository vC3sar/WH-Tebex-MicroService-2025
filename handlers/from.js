const express = require('express');
const router = express.Router();
const colors = require('colors');
const { debug, api } = require('./../config.json');
const logger = require('../lib/logger.js');
const { incrementMetric } = require('../lib/metrics.js');

const allowedWebhookIps = new Set(['18.209.80.3', '54.87.231.232', '127.0.0.1', '::ffff:127.0.0.1']);
const publicPaths = new Set(['/healthz', '/metrics']);

function normalizeIp(ip) {
  return String(ip || '').replace(/^::ffff:/, '');
}

function getClientIP(req) {
  return normalizeIp(req.headers['cf-connecting-ip'] || req.socket.remoteAddress);
}

router.use('/', function (req, res, next) {
  if (publicPaths.has(req.path)) {
    next();
    return;
  }

  if (req.path === '/favicon.ico' && api?.favicon_url) {
    return res.redirect(api.favicon_url);
  }

  const requestId = req.requestId;
  const ip = getClientIP(req);
  logger.info(`webhook source ip=${ip}`, { requestId });

  if (debug) {
    logger.info(`debug webhook ip=${ip}`, { requestId });
  }

  if (allowedWebhookIps.has(ip)) {
    incrementMetric('webhook_accepts_total');
    logger.info(`webhook accepted ip=${ip}`, { requestId });
    next();
    return;
  }

  incrementMetric('webhook_rejects_total');
  logger.warn(`webhook rejected ip=${ip}`, { requestId });
  return res.status(403).json({ error: 'Not authorized', requestId });
});

module.exports = router;
