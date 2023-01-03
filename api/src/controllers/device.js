const express = require("express");
const passport = require("passport");
const router = express.Router();

const DeviceObject = require("../models/device");
const SERVER_ERROR = "SERVER_ERROR";

const { uploadToS3FromBuffer, listAllObjects, getS3File } = require("../s3");

router.get("/files/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    let list = await listAllObjects(`code/${req.params.name}`);
    list = list.map((item) => item.Key.replace(`code/${req.params.name}/`, ""));
    res.status(200).send({ ok: true, data: list });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/file/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    const file = await getS3File(`code/${req.params.name}/${req.query.key}`);
    console.log(file, file);
    res.status(200).send({ ok: true, data: file });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/deletecode/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    await deleteDir(`code/${req.params.name}`);
    res.status(200).send({ ok: true });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/upload/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    console.log("Uploaded", `code/${req.params.name}/${req.body.path}`);
    await uploadToS3FromBuffer(`code/${req.params.name}/${req.body.path}`, new Buffer(req.body.buffer));
    res.status(200).send({ ok: true });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/:name", passport.authenticate(["user"], { session: false }), async (req, res) => {
  try {
    const obj = {};
    if (req.body.name) obj.name = req.body.name;
    if (req.body.description) obj.description = req.body.description;
    if (req.body.tags) obj.tags = req.body.tags;
    if (req.body.status) obj.status = req.body.status;
    if (req.body.version) obj.version = req.body.version;
    if (req.body.cpu) obj.cpu = req.body.cpu;
    if (req.body.mem) obj.mem = req.body.mem;
    if (req.body.date) obj.date = req.body.date;
    if (req.body.logs) obj.logs = req.body.logs;
    if (req.body.folder) obj.folder = req.body.folder;
    if (req.body.from) obj.from = req.body.from;

    await DeviceObject.findOneAndUpdate({ name: req.params.name }, obj, { upsert: true });

    res.status(200).send({ ok: true });
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
    // await ActivityObject.findByIdAndDelete(req.params.id);
    res.status(200).send({ ok: true, data: null });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
