const HOSTNAME = require("os").hostname();

let HOMEDIR = require("os").homedir();
if (HOMEDIR == "/root") HOMEDIR = "/home/pi";
console.log("LOADING ENV", `${HOMEDIR}/.selego-worker/.env`);

require("dotenv").config({ path: `${HOMEDIR}/.selego-worker/.env` });
require("dotenv").config({});

const { spawn, execSync, spawnSync } = require("child_process");
const fs = require("fs");
const osutils = require("os-utils");

const pjson = require("../package.json");
const logger = require("./logger");

const { getS3File, uploadStringToS3, uploadFileToS3, downloadDirFromS3, downloadFileFromS3, deleteDir } = require("./s3");

const WORKING_FOLDER = `${HOMEDIR}/.selego-worker/worker`;
const URLTOSCRIPT = `${WORKING_FOLDER}/code/src/index.js`;

const { CELLAR_BUCKET_NAME } = require("./config");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!CELLAR_BUCKET_NAME) logger.error(`No env loaded from ${HOMEDIR}/.selego-worker/.env`);

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
  logger.info(`Worker version ${pjson.version} started on ${HOSTNAME}`);
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

  await uploadStringToS3(`${HOSTNAME}/status.json`, { date: new Date(), status, version: pjson.version, cpu, mem });
}

async function uploadLogs() {
  await uploadFileToS3(`${WORKING_FOLDER}/logs/worker.log`, `${HOSTNAME}/worker.log`);
}

async function stop() {
  status = STATUS.STOPPED;
  logger.info(`Stoping script ${URLTOSCRIPT}`);
  if (!child) return;
  child.stdin.pause();
  child.kill("SIGINT");
  await sleep(5000);
  child = null;
}

async function start() {
  if (child) await stop();
  logger.info(`Starting script ${URLTOSCRIPT}`);
  status = STATUS.RUNNING;
  //, { shell: true }
  child = await spawn(`node`, [URLTOSCRIPT]);
  // console.log("child", child.stderr.toString());
  child.stdout.on("data", (e) => {
    logger.info(e.toString().trim());
  });
  child.on("error", (e) => logger.error("Error child", e.toString().trim()));
  child.on("close", (e, f) => {
    logger.error("Close child", (e || "").toString().trim());
  });
  child.on("exit", (e, f) => {
    const error = child.stderr.read();
    if (error) logger.error(error.toString());
    logger.error("Exit child", (e || "").toString().trim());
    // if (status === STATUS.RUNNING) {
    //   logger.error("Exit child with a crash !!!, restarting");
    //   start();
    // }
  });

  child.on("disconnect", (e) => logger.error("Disconnect child", (e || "").toString().trim()));
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
  if (!remoteConfiguration) return logger.error(`Doesn't have remote meta here ${HOSTNAME}/config.json`);

  const localConfiguration = await getLocalConfiguration();
  if (localConfiguration && localConfiguration.date === remoteConfiguration.date) return logger.verbose("No need to upgrade");

  logger.info("Upgrading");
  await stop();

  if (fs.existsSync(`${WORKING_FOLDER}/code`)) await fs.rmdirSync(`${WORKING_FOLDER}/code`, { recursive: true });

  await downloadDirFromS3(`${HOSTNAME}/code`, `${WORKING_FOLDER}/code`);
  logger.info("Start npm install");
  execSync("npm install", { cwd: `${WORKING_FOLDER}/code` });
  logger.info("End npm install");
  await downloadFileFromS3(`${HOSTNAME}/config.json`, `${WORKING_FOLDER}/config.json`);
  await uploadLogs();
  await start();
}
