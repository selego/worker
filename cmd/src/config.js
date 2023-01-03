let HOMEDIR = require("os").homedir();
if (HOMEDIR == "/root") HOMEDIR = "/home/pi";

const WORKING_FOLDER = `${HOMEDIR}/.selego-worker/worker`;
const LOG_PATH = `${WORKING_FOLDER}/logs/worker.log`;
const TOKEN_PATH = `${WORKING_FOLDER}/token.txt`;
const URLTOSCRIPT = `${WORKING_FOLDER}/code/src/index.js`;
const HOSTNAME = require("os").hostname();

module.exports = {
  LOG_PATH,
  WORKING_FOLDER,
  HOMEDIR,
  TOKEN_PATH,
  URLTOSCRIPT,
  HOSTNAME,
};
