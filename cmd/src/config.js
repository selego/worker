let HOMEDIR = require("os").homedir();
if (HOMEDIR == "/root") HOMEDIR = "/home/pi";

const WORKING_FOLDER = `${HOMEDIR}/.selego-worker/worker`;
const LOG_PATH = `${WORKING_FOLDER}/logs/worker.log`;

const URLTOSCRIPT = `${WORKING_FOLDER}/code/src/index.js`;
const HOSTNAME = require("os").hostname();

const SERVER = false ? "http://localhost:8080" : "https://sw.cleverapps.io";

module.exports = {
  LOG_PATH,
  WORKING_FOLDER,
  HOMEDIR,
  URLTOSCRIPT,
  HOSTNAME,
  SERVER,
};
