require("dotenv").config();

const { listObjects, getS3File } = require("./s3");

(async () => {
  const action = process.argv[2] || "list";
  const machine = process.argv[3] || "";

  if (action === "list") {
    const machines = await getAllMachines();
    for (let i = 0; i < machines.length; i++) {
      const status = await getStatus(machines[i]);
      console.log(machines[i]);
      console.log(`Status: ${status.date} || CPU: ${status.cpu}% || MEM: ${status.mem}%`);
      // console.log(`Running: ${status.date} || CPU: ${status.cpu}% || MEM: ${status.mem}%`);
      console.log(`\r`);
    }
  }

  if (action === "logs") {
    const logs = await getLogs(machine);
    return console.log(logs);
  }

  if (action === "status") {
    const status = await getStatus(machine);
    return console.log(status);
  }
})();

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
  if (!r) return `No Status for ${machine}`;
  return JSON.parse(r.Body.toString("utf8"));
}

async function getStatus(machine) {
  const r = await getS3File(`${machine}/status.json`);
  if (!r) return `No Status for ${machine}`;
  return JSON.parse(r.Body.toString("utf8"));
}
