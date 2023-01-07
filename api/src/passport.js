const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { SECRET } = require("./config");

// load up the user model
const User = require("./models/user");
const Device = require("./models/device");

function getToken(req) {
  let token = req.headers.jwt;
  return token;
}

module.exports = function (app) {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = SECRET;

  passport.use(
    "device",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        console.log(jwtPayload)
        const device = await Device.findOne({ _id: jwtPayload._id });
        if (device) return done(null, device);
      } catch (error) {
        console.log(error);
      }
      return done(null, false);
    })
  );

  passport.use(
    "user",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const user = await User.findOne({ _id: jwtPayload._id });
        if (user) return done(null, user);
      } catch (error) {
        console.log(error);
      }
      return done(null, false);
    })
  );

  app.use(passport.initialize());
};
