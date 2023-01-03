
const api = require("./api");
const { signin } = require("./auth");

(async () => {
  await signin();
  const machine = process.argv[2];
  await api.delete(`/device/${machine}`);
  console.log("Successfully deleted " + machine);
})();
