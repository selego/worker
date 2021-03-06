let HOMEDIR = require("os").homedir();
if (HOMEDIR == "/root") HOMEDIR = "/home/pi";

require("dotenv").config({ path: `${HOMEDIR}/.selego-worker/.env` });
require("dotenv").config({});

const os = require("os");

const { uploadDirToS3, uploadStringToS3, deleteDir, getS3File } = require("./s3");

(async () => {
  const folder = process.argv[2];
  const machine = process.argv[3];
  const name = getName();

  console.log(`Uploading : ${folder} on ${machine}`);

  const r = await getS3File(`${machine}/status.json`);
  if (!r) return console.log(`Machine ${machine} doesnt exist`);

  if (!folder) return console.log("No folder specified");
  if (!machine) return console.log("No machine specified");
  if (!name) return console.log("Please add a message");

  await deleteDir(`${machine}/code`);
  await uploadDirToS3(folder, `${machine}/code`);
  await uploadStringToS3(`${machine}/config.json`, { date: new Date(), folder, name, from: os.hostname() });
})();

function getName() {
  let str = "";
  for (let i = 4; i < process.argv.length || 20; i++) {
    if (!process.argv[i]) return str;
    str += process.argv[i] + " ";
  }
  return str;
}
