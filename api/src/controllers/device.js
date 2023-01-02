const express = require("express");
const passport = require("passport");
const router = express.Router();

const DeviceObject = require("../models/device");
const SERVER_ERROR = "SERVER_ERROR";

router.get("/", passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const query = {};
    const data = await DeviceObject.find(query).sort("-created_at");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/", passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const data = req.body;
    res.status(200).send({ ok: true, data });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    // await ActivityObject.findByIdAndDelete(req.params.id);
    res.status(200).send({ ok: true, data: null });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
