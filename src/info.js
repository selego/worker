const HOMEDIR = require("os").homedir();

require("dotenv").config({ path: `${HOMEDIR}/.selego-worker/.env` });
require("dotenv").config({ path: `/home/pi/.selego-worker/.env` });
require("dotenv").config({});


const { listObjects, getS3File } = require("./s3");

(async () => {
  const action = process.argv[2];
  const machine = process.argv[3] || "";

  if (action === "logs") {
    if (!machine) return console.log("Please provide a machine name");
    const logs = await getLogs(machine);
    return console.log(logs);
  }

  const machines = await getAllMachines();
  for (let i = 0; i < machines.length; i++) {
    const status = await getStatus(machines[i]);
    const configuration = await getConfiguration(machines[i]);
    console.log("\x1b[33m", machines[i], "\x1b[0m", `(${status.version})`);
    console.log(`-- Config: ${configuration.date} >> ${configuration.folder} >> ${configuration.name} >> ${configuration.from}`);
    console.log(`-- Status: Last alive ${timeSince(new Date(status.date))} || CPU: ${status.cpu}% || MEM: ${status.mem}%`);
    console.log(`\r`);
  }
})();



function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}
async function getAllMachines() {
  const arr = await listObjects({ Delimiter: "/" });
  return arr.CommonPrefixes.map((e) => e.Prefix.replace("/", "")).filter((e) => e);
}
async function getLogs(machine) {
  const r = await getS3File(`${machine}/worker.log`);
  if (!r) return `No logs for ${machine}`;
  return r.Body.toString("utf8");
}
async function getConfiguration(machine) {
  const r = await getS3File(`${machine}/config.json`);
  if (!r) return {};
  return JSON.parse(r.Body.toString("utf8"));
}
async function getStatus(machine) {
  const r = await getS3File(`${machine}/status.json`);
  if (!r) return `No Status for ${machine}`;
  return JSON.parse(r.Body.toString("utf8"));
}
