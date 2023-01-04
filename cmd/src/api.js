const fetch = require("node-fetch");

let dev = true;
const URL = dev ? "http://localhost:8080" : "https://sw.cleverapps.io";

class api {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async get(url) {
    const res = await fetch(`${URL}${url}`, { method: "GET", headers: { JWT: this.token, "Content-Type": "application/json" } });
    const data = await res.json();
    return data;
  }

  async post(url, body) {
    const res = await fetch(`${URL}${url}`, { method: "POST", body: JSON.stringify(body), headers: { JWT: this.token, "Content-Type": "application/json" } });
    const data = await res.json();
    return data;
  }
  async put(url, body) {
    const res = await fetch(`${URL}${url}`, { method: "PUT", body: JSON.stringify(body), headers: { JWT: this.token, "Content-Type": "application/json" } });
    const data = await res.json();
    console.log("data", data);
    return data;
  }

  async delete(url) {
    const res = await fetch(`${URL}${url}`, { method: "DELETE", headers: { JWT: this.token, "Content-Type": "application/json" } });
    const data = await res.json();
    return data;
  }
}

const n = new api();

module.exports = n;
