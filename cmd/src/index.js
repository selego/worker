const { HOSTNAME, WORKING_FOLDER, URLTOSCRIPT, LOG_PATH } = require("./config");

const { spawn, execSync, spawnSync } = require("child_process");
const fs = require("fs");
const osutils = require("os-utils");
const path = require("path");

const { getFile } = require("./utils");

const pjson = require("../package.json");
const logger = require("./logger");
const api = require("./api");

const { signin } = require("./auth");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

//npm run deploy ./ Sebs-MacBook-Pro.local test

(async () => {
  logger.info(`Worker version ${pjson.version} started on ${HOSTNAME}`);

  const s = await signin();
  if (!s) return;

  console.log("SIGNIN OK");

  // for new install, its faster
  await uploadStatus(); //ok
  await upgradeIfNeeded();
  // await start();

  // Check update every 3 minutes
  setInterval(upgradeIfNeeded, 3 * 60 * 1000);

  // Send log every 5 minute
  setInterval(uploadLogs, 5 * 60 * 1000);

  // Send status every 5 minutes
  setInterval(uploadStatus, 5 * 60 * 1000);
})();

async function uploadStatus() {
  const { cpu, mem } = await getMemoryUsage();
  await api.post(`/device/${HOSTNAME}`, { ping: new Date(), status, version: pjson.version, cpu, mem });
}

const uploadLogs = async () => {
  const logs = fs.readFileSync(LOG_PATH).toString();
  if (!logs) return;
  return await api.post(`/device/${HOSTNAME}`, { logs });
};

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

async function upgradeIfNeeded() {
  logger.verbose("#### Checking for upgrade");
  const { data: device } = await api.get(`/device/${HOSTNAME}`);
  if (!device.date) return logger.error(`Doesn't have remote meta here ${HOSTNAME}`);

  const localConfiguration = JSON.parse(await getFile(`${WORKING_FOLDER}/config.json`));
  if (localConfiguration && localConfiguration.date === device.date) return logger.verbose("No need to upgrade");

  logger.info("Upgrading");
  await stop();

  if (fs.existsSync(`${WORKING_FOLDER}/code`)) await fs.rmdirSync(`${WORKING_FOLDER}/code`, { recursive: true });

  const res = await api.get(`/device/files/${HOSTNAME}`);
  console.log(res);
  for (const file of res.files) {
    logger.info(`Downloading ${file}`);
    const { data } = await api.get(`/device/file/${HOSTNAME}?key=${file}`);
    const dir = path.dirname(`${WORKING_FOLDER}/code/${file}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await fs.writeFileSync(`${WORKING_FOLDER}/code/${file}`, Buffer.from(data.Body));
  }

  logger.info("Start npm install");

  execSync("npm install", { cwd: `${WORKING_FOLDER}/code` });
  logger.info("End npm install");

  await fs.writeFileSync(`${WORKING_FOLDER}/config.json`, JSON.stringify({ date: device.date }));
  await uploadLogs();
  await start();
}
