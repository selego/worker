const api = require("./api");
const { signinUser } = require("./auth");

(async () => {
  await signinUser();
  const machine = process.argv[2];
  await api.deleteUser(`/device/${machine}`);
  console.log("Successfully deleted " + machine);
})();
