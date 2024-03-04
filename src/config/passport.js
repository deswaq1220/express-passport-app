const passport = require("passport");
const User = require("../models/users.model");
const LocalStrategy = require("passport-local").Strategy;

// req.login(user)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// client => session => req
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLocaleLowerCase() });
        if (!user) {
          return done(null, false, {
            msg: `Email ${email} not found`,
          });
        }
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            msg: "Invalid email or password",
          });
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);
