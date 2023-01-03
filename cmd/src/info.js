const { signin } = require("./auth");
const api = require("./api");

(async () => {
  
  await signin();

  const action = process.argv[2];
  const machine = process.argv[3] || "";

  if (action === "logs") {
    if (!machine) return console.log("Please provide a machine name");
    const device = await api.get(`/device/${machine}`);
    return console.log(device.logs);
  }

  const { data: devices } = await api.get(`/device`);

  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];
    console.log("\x1b[33m", device.name, "\x1b[0m", `(${device.version})`);
    console.log(`-- Config: ${device.date} >> ${device.folder} >> ${device.description} >> ${device.from}`);
    console.log(`-- Status: Last alive ${timeSince(new Date(device.date))} || CPU: ${device.cpu}% || MEM: ${device.mem}%`);
    console.log(`-- Logs:\r`);
    console.log(`${(device.logs || "").substr(-400)}`);
    console.log(`\r\r`);
  }
})();

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}
