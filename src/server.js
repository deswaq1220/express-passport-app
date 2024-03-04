const express = require("express");
const path = require("path");
const { default: mongoose } = require("mongoose");
const User = require("./models/users.model");
const passport = require("passport");
const cookieSession = require("cookie-session");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middleware/auth");

const app = express();
const PORT = 3000;

const cookieEncryptionKey = "super-secretKey";
app.use(
  cookieSession({
    name: "cookie-sessionName",
    keys: [cookieEncryptionKey],
  })
);

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
mongoose.set("strictQuery", false);
mongoose
  .connect(
    `mongodb+srv://gwgw:qwer1234@cluster0.r4kcqgh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      console.log("no user found");
      return res.json({ msg: info });
    }

    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  })(req, res, next);
});

app.post("/logout", (req, res, next) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

app.get("/signup", checkNotAuthenticated, (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  //유저 객체 생성
  const user = new User(req.body);
  try {
    // 유저 컬렉션에 유저를 저장한다
    await user.save();
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
