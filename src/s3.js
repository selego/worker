const AWS = require("aws-sdk");
const path = require("path");
const logger = require("./logger");
const fs = require("fs");

const { CELLAR_ADDON_HOST, CELLAR_ADDON_KEY_ID, CELLAR_ADDON_KEY_SECRET, CELLAR_BUCKET_NAME } = require("./config");

let s3 = new AWS.S3({ endpoint: CELLAR_ADDON_HOST, accessKeyId: CELLAR_ADDON_KEY_ID, secretAccessKey: CELLAR_ADDON_KEY_SECRET });

async function uploadFileToS3(fromPathLocal, toPathS3) {
  const exist = await fs.existsSync(fromPathLocal);
  if (!exist) return logger.error(`${fromPathLocal} does not exist`);
  const params = { Bucket: CELLAR_BUCKET_NAME, Key: toPathS3, Body: fs.readFileSync(fromPathLocal) };
  s3.putObject(params, function (err, data) {
    if (err) return logger.error(err);
    logger.verbose("Successfully uploaded " + fromPathLocal + " to " + `${CELLAR_BUCKET_NAME}/${toPathS3}`);
  });
}

async function uploadDirToS3(localPath, to) {
  localPath = localPath.replace(/\/$/, "");
  function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
      if (["node_modules"].includes(name)) return;
      var filePath = path.join(currentDirPath, name);
      var stat = fs.statSync(filePath);
      if (stat.isFile()) {
        callback(filePath, stat);
      } else if (stat.isDirectory()) {
        walkSync(filePath, callback);
      }
    });
  }

  walkSync(localPath, function (filePath) {
    let bucketPath = `${to}/` + filePath.substring(localPath.length + 1);
    let params = { Bucket: CELLAR_BUCKET_NAME, Key: bucketPath, Body: fs.readFileSync(filePath) };
    s3.putObject(params, function (err, data) {
      if (err) {
        logger.error(err);
      } else {
        logger.info("Successfully uploaded " + bucketPath + " to " + CELLAR_BUCKET_NAME);
      }
    });
  });
}

const listObjects = ({ Delimiter }) => {
  return new Promise((resolve, reject) => {
    var params = { Bucket: CELLAR_BUCKET_NAME, Delimiter };
    s3.listObjects(params, function (err, data) {
      if (err) throw err;
      resolve(data);
    });
  });
};

function getS3File(name) {
  const p = new Promise((resolve, reject) => {
    const params = { Bucket: CELLAR_BUCKET_NAME, Key: name };
    s3.getObject(params, (err, data) => {
      if (err) return resolve(null);
      resolve(data);
    });
  });
  return p;
}

async function uploadStringToS3(key, content) {
  return new Promise((resolve, reject) => {
    s3.putObject({ Bucket: CELLAR_BUCKET_NAME, Key: key, Body: JSON.stringify(content), ContentType: "application/json" }, function (err, data) {
      if (err) logger(err);
      resolve();
    });
  });
}

async function deleteDir(dir) {
  const listParams = { Bucket: CELLAR_BUCKET_NAME, Prefix: dir };

  const listedObjects = await s3.listObjectsV2(listParams).promise();
  if (listedObjects.Contents.length === 0) return;

  const deleteParams = { Bucket: CELLAR_BUCKET_NAME, Delete: { Objects: [] } };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await emptyS3Directory(CELLAR_BUCKET_NAME, dir);
}

function downloadFileFromS3(s3File, localPath) {
  return new Promise(async (resolve, reject) => {
    const data = await s3.getObject({ Bucket: CELLAR_BUCKET_NAME, Key: s3File }).promise();
    const dir = path.dirname(`${localPath}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${localPath}`, data.Body);
    logger.info(`${localPath} successfully downloaded`);
    resolve();
  });
}

function downloadDirFromS3(s3folder, localPath) {
  return new Promise(async (resolve, reject) => {
    const listParams = { Bucket: CELLAR_BUCKET_NAME, Prefix: s3folder };
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    if (listedObjects.Contents.length === 0) return;
    for (let i = 0; i < listedObjects.Contents.length; i++) {
      const { Key } = listedObjects.Contents[i];
      const data = await s3.getObject({ Bucket: CELLAR_BUCKET_NAME, Key }).promise();
      const location = Key.replace(`${s3folder}/`, "");

      const dir = path.dirname(`${localPath}/${location}`);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(`${localPath}/${location}`, data.Body);
      logger.info(`${localPath}/${location} successfully downloaded`);
    }

    resolve();
  });
}

// console.log("uploadFiletoS3", uploadFiletoS3);

module.exports = {
  uploadDirToS3,
  uploadFileToS3,
  uploadStringToS3,
  downloadDirFromS3,
  downloadFileFromS3,
  listObjects,
  deleteDir,
  getS3File,
};
