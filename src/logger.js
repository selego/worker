const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

const logger = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new transports.Console(), new transports.File({ filename: "./logs/worker.log", maxsize: 10000, maxFiles: 5, tailable: true })],
});

module.exports = logger;
