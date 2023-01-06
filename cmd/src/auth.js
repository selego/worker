const { TOKEN_PATH, HOSTNAME } = require("./config");

const fs = require("fs");
const readline = require("readline");

const { getFile } = require("./utils");
const api = require("./api");

async function signin() {
  return new Promise(async (resolve, reject) => {
    try {
      {
        const token = await getFile(TOKEN_PATH);
        if (token) {
          api.setToken(token);
          const data = await api.get(`/user/signin_token`);
          if (data.ok) return resolve(true);
        }
      }
      {
        const email = await question("Email ? ");
        const password = await question("Password ? ");
        const data = await api.post(`/user/signin`, { email, password });
        if (data.token) {
          api.setToken(data.token);
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

async function question(str) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(str, async (yo) => {
      resolve(yo);
    });
  });
}

module.exports = { signin };
