require("dotenv").config();

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");

require("./mongo");

const { PORT, APP_URL } = require("./config.js");

const app = express();

const origin = [APP_URL];

app.use(cors({ credentials: true, origin }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(__dirname + "/../public"));

app.use("/user", require("./controllers/user"));
app.use("/device", require("./controllers/device"));

app.get("/", async (req, res) => {
  res.status(200).send("COUCOU ");
});

require("./passport")(app);

app.listen(PORT, () => console.log("Listening on port " + PORT));
