const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

const DeviceObject = require("../models/device");
const config = require("../config");
const { deleteDir } = require("../s3");

const SERVER_ERROR = "SERVER_ERROR";
const JWT_MAX_AGE = 1000 * 60 * 60 * 24 * 365; // 1 year

const { uploadToS3FromBuffer, listAllObjects, getS3File } = require("../s3");

// (async () => {
//   await DeviceObject.collection.drop();
//   console.log("deleted");
// })();

router.get("/signin_token", passport.authenticate("device", { session: false }), async (req, res) => {
  try {
    if (!req.user) return res.status(200).send({ ok: false, code: "DEVICE_NOT_EXISTS" });
    return res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { hostname, name } = req.body;
    const device = await DeviceObject.create({ hostname, name });
    const token = jwt.sign({ _id: device._id }, config.SECRET, { expiresIn: JWT_MAX_AGE });
    res.status(200).send({ ok: true, data: { token } });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/files", passport.authenticate(["device"], { session: false }), async (req, res) => {
  try {
    const device = req.user;
    let list = await listAllObjects(`code/${device._id}`);
    list = list.map((item) => item.Key.replace(`code/${device._id}/`, ""));
    console.log(list);
    res.status(200).send({ ok: true, data: list });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/file", passport.authenticate(["device"], { session: false }), async (req, res) => {
  try {
    const device = req.user;
    const file = await getS3File(`code/${device._id}/${req.query.key}`);
    res.status(200).send({ ok: true, data: file });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/deletecode/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    const device = await DeviceObject.findOne({ name: req.params.name });
    if (!device) return res.status(200).send({ ok: false, code: "DEVICE_NOT_EXISTS" });
    await deleteDir(`code/${device._id}`);
    res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/upload/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    const device = await DeviceObject.findOne({ name: req.params.name });
    if (!device) return res.status(200).send({ ok: false, code: "DEVICE_NOT_EXISTS" });
    console.log("Uploaded", `code/${device._id}/${req.body.path}`);
    await uploadToS3FromBuffer(`code/${device._id}/${req.body.path}`, new Buffer(req.body.buffer));
    res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/update/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    const device = await DeviceObject.findOne({ name: req.params.name });
    if (!device) return res.status(200).send({ ok: false, code: "DEVICE_NOT_EXISTS" });

    if (req.body.date) device.date = req.body.date;
    if (req.body.description) device.description = req.body.description;
    if (req.body.from) device.from = req.body.from;
    await device.save();

    res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate(["device"], { session: false }), async (req, res) => {
  try {
    const device = req.user;

    if (req.body.status) device.status = req.body.status;
    if (req.body.version) device.version = req.body.version;
    if (req.body.cpu) device.cpu = req.body.cpu;
    if (req.body.mem) device.mem = req.body.mem;
    if (req.body.date) device.date = req.body.date;
    if (req.body.logs) device.logs = req.body.logs;
    if (req.body.folder) device.folder = req.body.folder;
    if (req.body.ping) device.ping = req.body.ping;

    await device.save();
    res.status(200).send({ ok: true });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/date", passport.authenticate(["device"], { session: false }), async (req, res) => {
  try {
    return res.status(200).send({ ok: true, data: req.user.date });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    const data = await DeviceObject.findOne({ name: req.params.name });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    const data = await DeviceObject.find();
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    await DeviceObject.findByIdAndDelete(req.params.id);
    res.status(200).send({ ok: true });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
