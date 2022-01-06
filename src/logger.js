const HOMEDIR = require("os").homedir();
const WORKING_FOLDER = `${HOMEDIR}/.selego-worker/worker`;

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

const logger = createLogger({
  format: combine(timestamp(), myFormat),
  level: "info",
  transports: [new transports.Console(), new transports.File({ filename: `${WORKING_FOLDER}/logs/worker.log`, maxsize: 50000, maxFiles: 5, tailable: true })],
});

module.exports = logger;
