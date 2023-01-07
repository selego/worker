const { HOSTNAME } = require("./config");
const fs = require("fs");

const logger = require("./logger");
const { uploadDirToS3 } = require("./utils");
const api = require("./api");
const { signinUser } = require("./auth");

(async () => {
  await signinUser();

  const folder = process.argv[2];
  const name = process.argv[3];
  const description = getDescription();

  console.log(`Uploading : ${folder} on ${name}`);

  if (!folder) return console.log("No folder specified");
  if (!name) return console.log("No machine specified");
  if (!description) return console.log("Please add a description");

  const { code } = await api.postUser(`/device/deletecode/${name}`);
  if (code) return console.log("Error deleting code :" + code);
  console.log(`Code delete on ${name}`);

  await uploadDirToS3(folder, async (e) => {
    var buffer = fs.readFileSync(e);
    await api.postUser(`/device/upload/${name}`, { buffer, path: e });
    console.log("Successfully uploaded " + e);
  });
  await api.postUser(`/device/update/${name}`, { date: new Date(), description, folder, from: HOSTNAME });
  return;
})();



//

function getDescription() {
  let str = "";
  for (let i = 4; i < process.argv.length || 20; i++) {
    if (!process.argv[i]) return str;
    str += process.argv[i] + " ";
  }
  return str;
}
