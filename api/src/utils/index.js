const passwordValidator = require("password-validator");
const AWS = require("aws-sdk");

function validatePassword(password) {
  const schema = new passwordValidator();
  schema
    .is()
    .min(6) // Minimum length 6
    .is()
    .max(100) // Maximum length 100
    .has()
    .letters(); // Must have letters

  return schema.validate(password);
}

function uploadToS3FromBuffer(path, buffer, ContentType) {
  return new Promise((resolve, reject) => {
    let s3bucket = new AWS.S3({
      endpoint: "",
      accessKeyId: "",
      secretAccessKey: "",
    });

    // s3bucket.listBuckets(function (err, data) {
    //   if (err) {
    //     console.log("Error", err);
    //   } else {
    //     console.log("Success", data.Buckets);
    //   }
    // });

    // var bucketParams = {
    //   Bucket: "bank",
    //   CreateBucketConfiguration: {
    //     LocationConstraint: "",
    //   },
    // };
    // s3bucket.createBucket(bucketParams, function (err, data) {
    //   if (err) {
    //     console.log("Error", err);
    //   } else {
    //     console.log("Success", data.Location);
    //   }
    // });

    var params = {
      ACL: "public-read",
      Bucket: "bank",
      Key: path,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType,
      Metadata: { "Cache-Control": "max-age=31536000" },
    };
    s3bucket.upload(params, function (err, data) {
      if (err) return reject(`error in callback:${err}`);
      resolve(data.Location);
    });
  });
}

module.exports = {
  validatePassword,
  uploadToS3FromBuffer,
};
