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

// Función para verificar si una IP es interna (Docker)
function isDockerIP(ip) {
    return /^172\./.test(ip) || /^192\./.test(ip) || /^10\./.test(ip);
}

// Función para obtener la IP real
function getClientIP(req) {
    const realIP = req.headers['cf-connecting-ip'] || req.socket.remoteAddress;
    return isDockerIP(realIP) ? req.headers['cf-connecting-ip'] : realIP;
}

router.use('/', function (req, res, next) {
    if (req.path === '/favicon.ico') return res.redirect(api.favicon_url);

    const ip = getClientIP(req);  // Obtener la IP real
    // Actualizar log
    logger.info('Request received from: ' + ip);

    if (debug) { 
        console.log(`${colors.gray(`Nueva venta, debug mode on || from: ${ip}`)}`); 
    }

    // Verificar si la IP es una de las autorizadas
    if (ip === '18.209.80.3' || ip === '54.87.231.232') { 
        next(); 
    } else {
        console.log(colors.red(`Bad Request from: ${ip}`));
        return res.status(403).jsonp({ error: 'Not authorized' });
    }
});

module.exports = router;
