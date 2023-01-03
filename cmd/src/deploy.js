const { HOSTNAME } = require("./config");
const fs = require("fs");

const logger = require("./logger");
const { uploadDirToS3 } = require("./utils");
const api = require("./api");
const { signin } = require("./auth");

(async () => {
  await signin();

  const folder = process.argv[2];
  const machine = process.argv[3];
  const description = getDescription();

  console.log(`Uploading : ${folder} on ${machine}`);

  if (!folder) return console.log("No folder specified");
  if (!machine) return console.log("No machine specified");
  if (!description) return console.log("Please add a description");

  const { data } = await api.get(`/device/${machine}`);
  if (!data) return console.log("Machine not found");

  await api.post(`/device/deletecode/${machine}`);
  console.log(`Code delete on ${machine}`);

  await uploadDirToS3(folder, async (e) => {
    var buffer = fs.readFileSync(e);
    await api.post(`/device/upload/${machine}`, { buffer, path: e });
    console.log("Successfully uploaded " + e);
  });
  await api.post(`/device/${machine}`, { date: new Date(), description, folder, from: HOSTNAME });
  return;
})();

function getDescription() {
  let str = "";
  for (let i = 4; i < process.argv.length || 20; i++) {
    if (!process.argv[i]) return str;
    str += process.argv[i] + " ";
  }
  return str;
}
