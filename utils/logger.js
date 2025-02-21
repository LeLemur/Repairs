// utils/logger.js – Setup Winston logger for robust logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    // Optionally add file transports here
  ]
});

exports.loginPage = (req, res) => {
  console.log("Rendering login page");
  res.render("login", { error: null });
};

module.exports = logger;
