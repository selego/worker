const { createLogger, format, transports } = require("winston");

const { LOG_PATH } = require("./config");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

const logger = createLogger({
  format: combine(timestamp(), myFormat),
  level: "info",
  transports: [new transports.Console(), new transports.File({ filename: LOG_PATH, maxsize: 50000, maxFiles: 5, tailable: true })],
});

module.exports = logger;
