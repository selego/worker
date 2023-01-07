const fetch = require("node-fetch");

const { SERVER } = require("./config");

class api {
  constructor() {
    this.token = null;
  }

  setUserToken(token) {
    this.userToken = token;
  }

  setDeviceToken(token) {
    this.deviceToken = token;
  }

  async getDevice(url) {
    const res = await fetch(`${SERVER}${url}`, { method: "GET", headers: { JWT: this.deviceToken, "Content-Type": "application/json" } });
    return await res.json();
  }

  async postDevice(url, body) {
    const res = await fetch(`${SERVER}${url}`, { method: "POST", body: JSON.stringify(body), headers: { JWT: this.deviceToken, "Content-Type": "application/json" } });
    return await res.json();
  }

  async putDevice(url, body) {
    const res = await fetch(`${SERVER}${url}`, { method: "PUT", body: JSON.stringify(body), headers: { JWT: this.deviceToken, "Content-Type": "application/json" } });
    return await res.json();
  }

  async getUser(url) {
    const res = await fetch(`${SERVER}${url}`, { method: "GET", headers: { JWT: this.userToken, "Content-Type": "application/json" } });
    return await res.json();
  }

  async postUser(url, body) {
    const res = await fetch(`${SERVER}${url}`, { method: "POST", body: JSON.stringify(body), headers: { JWT: this.userToken, "Content-Type": "application/json" } });
    return await res.json();
  }

  async putUser(url, body) {
    const res = await fetch(`${SERVER}${url}`, { method: "PUT", body: JSON.stringify(body), headers: { JWT: this.userToken, "Content-Type": "application/json" } });
    return await res.json();
  }

  async deleteUser(url, body) {
    const res = await fetch(`${SERVER}${url}`, { method: "DELETE", body: JSON.stringify(body), headers: { JWT: this.userToken, "Content-Type": "application/json" } });
    return await res.json();
  }
}

const n = new api();

module.exports = n;
