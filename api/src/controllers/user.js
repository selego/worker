const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const router = express.Router();

const config = require("../config");

const UserObject = require("../models/user");

const { validatePassword } = require("../utils");

const SERVER_ERROR = "SERVER_ERROR";
const USER_ALREADY_REGISTERED = "USER_ALREADY_REGISTERED";
const PASSWORD_NOT_VALIDATED = "PASSWORD_NOT_VALIDATED";
const EMAIL_OR_PASSWORD_INVALID = "EMAIL_OR_PASSWORD_INVALID";
const EMAIL_AND_PASSWORD_REQUIRED = "EMAIL_AND_PASSWORD_REQUIRED";

const JWT_MAX_AGE = 1000 * 60 * 60 * 24 * 365; // 1 year

// (async () => {
//   const arr = await UserObject.find();
//   // await UserObject.deleteMany({});
//   console.log("arr", arr);
//   // await UserObject.create({ name: "Seb", email: "se.legoff@gmail.com", password: "Coucou2&" });
// })();

router.post("/signin", async (req, res) => {
  let { password, email } = req.body;

  email = (email || "").trim().toLowerCase();

  console.log("LA", req.body);
  if (!email || !password) return res.status(400).send({ ok: false, code: EMAIL_AND_PASSWORD_REQUIRED });

  try {
    const user = await UserObject.findOne({ email });
    if (!user) return res.status(401).send({ ok: false, code: USER_NOT_EXISTS });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).send({ ok: false, code: EMAIL_OR_PASSWORD_INVALID });
    user.set({ last_login_at: Date.now() });
    await user.save();
    const token = jwt.sign({ _id: user.id }, config.SECRET, { expiresIn: JWT_MAX_AGE });
    return res.status(200).send({ ok: true, token, user });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).send({ ok: true });
  } catch (error) {
    return res.status(500).send({ ok: false, error });
  }
});

router.get("/signin_token", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { user } = req;
    user.set({ last_login_at: Date.now() });
    const u = await user.save();
    return res.status(200).send({ user, ok: true });
  } catch (error) {
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/forgot_password", async (req, res) => {
  try {
    // const obj = await this.model.findOne({ email: req.body.email.toLowerCase() });

    // if (!obj) return res.status(401).send({ ok: false, code: EMAIL_OR_PASSWORD_INVALID });

    // if (!obj.password) return res.status(401).send({ ok: false, code: ACOUNT_NOT_ACTIVATED, user: obj });

    // const token = await crypto.randomBytes(20).toString("hex");
    // obj.set({ forgot_password_reset_token: token, forgot_password_reset_expires: Date.now() + 86400 });
    // await obj.save();

    // await sendinblue.sendTemplate(SENDINBLUE_TEMPLATES.FORGOT_PASSWORD, {
    //   emailTo: [{ email: obj.email }],
    //   params: { cta: `${config.APP_URL}/auth/reset?token=${token}` },
    // });

    res.status(200).send({ ok: true });
  } catch (error) {
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});
router.post("/forgot_password_reset", async (req, res) => {
  try {
    // const obj = await this.model.findOne({
    //   forgot_password_reset_token: req.body.token,
    //   forgot_password_reset_expires: { $gt: Date.now() },
    // });

    // if (!obj) return res.status(400).send({ ok: false, code: PASSWORD_TOKEN_EXPIRED_OR_INVALID });

    // if (!validatePassword(req.body.password)) return res.status(400).send({ ok: false, code: PASSWORD_NOT_VALIDATED });

    // obj.password = req.body.password;
    // obj.forgot_password_reset_token = "";
    // obj.forgot_password_reset_expires = "";
    // await obj.save();
    return res.status(200).send({ ok: true });
  } catch (error) {
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});
router.post("/reset_password", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    // const match = await req.user.comparePassword(req.body.password);
    // if (!match) {
    //   return res.status(401).send({ ok: false, code: PASSWORD_INVALID });
    // }
    // if (req.body.newPassword !== req.body.verifyPassword) {
    //   return res.status(422).send({ ok: false, code: PASSWORDS_NOT_MATCH });
    // }
    // if (!validatePassword(req.body.newPassword)) {
    //   return res.status(400).send({ ok: false, code: PASSWORD_NOT_VALIDATED });
    // }
    // const obj = await this.model.findById(req.user._id);

    // obj.set({ password: req.body.newPassword });
    // await obj.save();
    return res.status(200).send({ ok: true, user: obj });
  } catch (error) {
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await UserObject.findOne({ _id: req.params.id });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/", passport.authenticate(["admin"], { session: false }), async (req, res) => {
  try {
    if (!validatePassword(req.body.password)) return res.status(400).send({ ok: false, user: null, code: PASSWORD_NOT_VALIDATED });
    req.body.organisation_id = req.user.organisation_id;
    req.body.organisation_name = req.user.organisation_name;

    const user = await UserObject.create(req.body);

    return res.status(200).send({ data: user, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: USER_ALREADY_REGISTERED });
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

//@check
router.put("/:id", passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const obj = req.body;
    const user = await UserObject.findByIdAndUpdate(req.params.id, obj, { new: true });
    res.status(200).send({ ok: true, user });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("admin", { session: false }), async (req, res) => {
  try {
    await UserObject.findOneAndRemove({ _id: req.params.id });
    res.status(200).send({ ok: true });
  } catch (error) {
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
