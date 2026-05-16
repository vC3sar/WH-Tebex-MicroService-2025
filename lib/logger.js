const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, requestId }) => {
      const requestSuffix = requestId ? ` requestId=${requestId}` : '';
      return `${timestamp} ${level}${requestSuffix} ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log', level: 'info' })
  ]
});

module.exports = logger;
