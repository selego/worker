require("dotenv").config();
const os = require("os");

const { uploadDirToS3, uploadStringToS3, deleteDir } = require("./s3");

(async () => {
  const folder = process.argv[2];
  const machine = process.argv[3];
  const name = process.argv[4];

  console.log(`Uploading : ${folder} on ${machine}`);
  if (!folder) return console.log("No folder specified");
  if (!machine) return console.log("No machine specified");
  if (!name) return console.log("Please add a message");

  await deleteDir(`${machine}/code`);
  await uploadDirToS3(folder, `${machine}/code`);
  await uploadStringToS3(`${machine}/config.json`, { date: new Date(), folder, name, from: os.hostname() });
})();
