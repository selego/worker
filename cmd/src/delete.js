const api = require("./api");
const { signinUser } = require("./auth");

(async () => {
  await signinUser();
  const id = process.argv[2];
  await api.deleteUser(`/device/${id}`);
  console.log("Successfully deleted " + id);
})();
