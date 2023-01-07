const { WORKING_FOLDER, HOSTNAME } = require("./config");
const TOKEN_PATH = `${WORKING_FOLDER}/token.txt`;
const TOKEN_DEVICE_PATH = `${WORKING_FOLDER}/token_device.txt`;

const fs = require("fs");
const readline = require("readline");

const { getFile } = require("./utils");
const api = require("./api");

async function signinUser() {
  return new Promise(async (resolve, reject) => {
    try {
      {
        const token = await getFile(TOKEN_PATH);
        if (token) {
          api.setUserToken(token);
          const data = await api.getUser(`/user/signin_token`);
          if (data.ok) return resolve(true);
        }
      }
      {
        const email = await question("Email ? ");
        const password = await question("Password ? ");
        const data = await api.postUser(`/user/signin`, { email, password });
        if (data.token) {
          api.setUserToken(data.token);
          fs.writeFileSync(TOKEN_PATH, data.token);
          resolve(true);
        }
      }
    } catch (e) {
      console.log("e", e);
      resolve(false);
    }
  });
  return false;
}
async function signinDevice() {
  return new Promise(async (resolve, reject) => {
    try {
      {
        const token = await getFile(TOKEN_DEVICE_PATH);
        if (token) {
          api.setDeviceToken(token);
          try {
            const data = await api.getDevice(`/device/signin_token`);
            if (data.ok) return resolve(true);
          } catch (e) {}
        }
      }
      {
        console.log("Create a new device");
        const { data } = await api.postDevice(`/device/create`, { name: HOSTNAME, hostname: HOSTNAME });
        if (data.token) {
          api.setDeviceToken(data.token);
          fs.writeFileSync(TOKEN_DEVICE_PATH, data.token);
          resolve(true);
        }
      }
    } catch (e) {
      console.log("e", e);
      resolve(false);
    }
  });
  return false;
}

async function question(str) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(str, async (yo) => {
      resolve(yo);
    });
  });
}

module.exports = { signinUser, signinDevice };
