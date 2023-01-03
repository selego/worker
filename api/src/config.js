const ENVIRONMENT = getEnvironment();
const MONGO_URL = process.env.MONGO_URL || "";

const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET || "not-so-secret";
const APP_URL = process.env.APP_URL || "http://localhost:8082";

const CELLAR_ADDON_HOST = process.env.CELLAR_ADDON_HOST;
const CELLAR_ADDON_KEY_ID = process.env.CELLAR_ADDON_KEY_ID;
const CELLAR_ADDON_KEY_SECRET = process.env.CELLAR_ADDON_KEY_SECRET;
const CELLAR_BUCKET_NAME = process.env.CELLAR_BUCKET_NAME;

const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;

module.exports = {
  PORT,
  MONGO_URL,
  SECRET,
  APP_URL,
  ENVIRONMENT,
  SENDINBLUE_API_KEY,
  CELLAR_ADDON_HOST,
  CELLAR_ADDON_KEY_ID,
  CELLAR_ADDON_KEY_SECRET,
  CELLAR_BUCKET_NAME,
};

function getEnvironment() {
  return process.env.ENVIRONMENT || "development";
}
