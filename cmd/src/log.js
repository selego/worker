const { signinUser } = require("./auth");
const api = require("./api");

(async () => {
  await signinUser();
  const name = process.argv[2];
  if (!name) return console.log("Please provide a machine name");
  const { data: device } = await api.getUser(`/device/${name}`);
  return console.log(device.logs);
})();
