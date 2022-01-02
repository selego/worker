require("dotenv").config({ path: `~/.selego-worker/.env` });
require("dotenv").config({});

const { spawn, execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const osutils = require("os-utils");

const pjson = require("../package.json");

const logger = require("./logger");

const { getS3File, uploadStringToS3, uploadFileToS3, downloadDirFromS3, downloadFileFromS3 } = require("./s3");

const HOSTNAME = os.hostname();
const WORKING_FOLDER = `../worker`;
const URLTOSCRIPT = `${WORKING_FOLDER}/code/src/index.js`;

const STATUS = { RUNNING: "RUNNING", STOPPED: "STOPPED" };

let child = null;
let status = STATUS.STOPPED;

const getMemoryUsage = () => {
  return new Promise((resolve, reject) => {
    osutils.cpuUsage((cpu) => {
      const mem = osutils.freememPercentage();
      const obj = { mem: (mem * 100).toFixed(2), cpu: (cpu * 100).toFixed(2) };
      logger.verbose(`Memory usage: ${obj.mem}% CPU usage: ${obj.cpu}%`);
      resolve(obj);
    });
  });
};

(async () => {
  // for new install, its faster
  await uploadStatus();

  await upgradeIfNeeded();
  await start();

  // Check update every 3 minutes
  setInterval(upgradeIfNeeded, 3 * 60 * 1000);

  // Send log every 5 minute
  setInterval(uploadLogs, 5 * 60 * 1000);

  // Send status every 5 minutes
  setInterval(uploadStatus, 5 * 60 * 1000);
})();

async function uploadStatus() {
  const { cpu, mem } = await getMemoryUsage();
  uploadStringToS3(`${HOSTNAME}/status.json`, { date: new Date(), status, version: pjson.version, cpu, mem });
}

async function uploadLogs() {
  await uploadFileToS3(`./logs/worker.log`, `${HOSTNAME}/worker.log`);
}

async function stop() {
  logger.info(`Stoping script ${URLTOSCRIPT}`);
  if (!child) return;
  child.stdin.pause();
  child.kill("SIGINT");
  child = null;
}

async function start() {
  if (child) await stop();
  logger.info(`Starting script ${URLTOSCRIPT}`);
  status = STATUS.RUNNING;
  child = spawn(`node`, [URLTOSCRIPT]);
  child.stdout.on("data", (e) => logger.info(e.toString().trim()));
  child.on("error", (e) => logger.error("Error child", e.toString().trim()));
  child.on("close", (e) => logger.error("Close child", (e || "").toString().trim()));
}

async function getLocalConfiguration() {
  const exist = fs.existsSync(`${WORKING_FOLDER}/config.json`);
  if (!exist) return null;
  const localConfiguration = fs.readFileSync(`${WORKING_FOLDER}/config.json`);
  return JSON.parse(localConfiguration.toString("utf8"));
}

async function getRemoteConfiguration() {
  const r = await getS3File(`${HOSTNAME}/config.json`);
  if (!r) return null;
  return JSON.parse(r.Body.toString("utf8"));
}

async function upgradeIfNeeded() {
  logger.verbose("#### Checking for upgrade");
  const remoteConfiguration = await getRemoteConfiguration();
  if (!remoteConfiguration) {
    logger.error("Doesn't have remote meta");
    return false;
  }

  const localConfiguration = await getLocalConfiguration();

  if (localConfiguration && localConfiguration.date === remoteConfiguration.date) {
    return logger.verbose("No need to upgrade");
  }

  logger.info("Upgrading");
  await stop();
  await fs.rmdirSync(`${WORKING_FOLDER}/code`, { recursive: true });
  await downloadDirFromS3(`${HOSTNAME}/code`, `${WORKING_FOLDER}/code`);
  logger.info("Start npm install");
  execSync("npm install", { cwd: `${WORKING_FOLDER}/code` });
  logger.info("End npm install");
  await downloadFileFromS3(`${HOSTNAME}/config.json`, `${WORKING_FOLDER}/config.json`);
  await uploadLogs();
  await start();
}
