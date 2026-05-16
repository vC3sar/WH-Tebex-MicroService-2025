const express = require('express');
const router = express.Router();
const { debug } = require('./../config.json');
const logger = require('../lib/logger.js');
const { incrementMetric } = require('../lib/metrics.js');

router.use('/', function (req, res, next) {
    const requestBody = req.body;
    const requestId = req.requestId;

    if (requestBody && requestBody.type === 'validation.webhook') {
        incrementMetric('webhook_validations_total');
        logger.info('webhook validation request completed', { requestId });
        if (debug === true) { logger.info('debug validation webhook', { requestId }); }
        return res.status(200).json(req.body);
    }

    if (debug === true) { logger.info('debug webhook passed to next middleware', { requestId }); }
    return next();
});

module.exports = router;
