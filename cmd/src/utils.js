const fs = require("fs");
const path = require("path");


async function getFile(path) {
  const exist = fs.existsSync(path);
  if (!exist) return null;
  const localConfiguration = fs.readFileSync(path);
  return localConfiguration.toString("utf8");
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

async function uploadDirToS3(localPath, cb) {
  localPath = path.resolve(localPath);
  async function walkSync(currentDirPath) {
    fs.readdirSync(currentDirPath).forEach(async function (name) {
      if (["node_modules", ".git"].includes(name)) return;
      var filePath = path.join(currentDirPath, name);
      var stat = fs.statSync(filePath);
      if (stat.isFile()) {
        let bucketPath = filePath.substring(localPath.length + 1);
        await cb(bucketPath);
      } else if (stat.isDirectory()) {
        walkSync(filePath);
      }
    });
  }
  await walkSync(localPath);
}

module.exports = {
  getFile,
  deleteDir,
  uploadDirToS3,
};
