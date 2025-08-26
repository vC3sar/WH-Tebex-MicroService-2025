const express = require('express');
const fs = require('fs');
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

// function to check if an IP is internal (Docker)
function isDockerIP(ip) {
    return /^172\./.test(ip) || /^192\./.test(ip) || /^10\./.test(ip) || /^::ffff:/.test(ip);;
}

// function to get the real IP address
function getClientIP(req) {
    const realIP = req.headers['cf-connecting-ip'] || req.socket.remoteAddress;
    return isDockerIP(realIP) ? req.headers['cf-connecting-ip'] : realIP;
}

router.use('/', function (req, res, next) {
    if (req.path === '/favicon.ico') return res.redirect(api.favicon_url);

    const ip = getClientIP(req);  // get real IP address
    // update logs
    logger.info('Request received from: ' + ip);

    if (debug) { 
        console.log(`${colors.gray(`Nueva venta, debug mode on || from: ${ip}`)}`); 
    }

    // verify if the IP is one of the authorized ones
    // neede update with new IPs from tebex (2025-08-26)
    // you can find the updated list here: https://docs.tebex.io/developers/webhooks/overview#ip-address
    if (ip === '18.209.80.3' || ip === '54.87.231.232') { 
        next(); 
    } else {
        console.log(colors.red(`Bad Request from: ${ip}`));
        return res.status(403).jsonp({ error: 'Not authorized' });
    }
});

module.exports = router;
