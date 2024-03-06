const express = require("express");
const User = require("../models/users.model");
const passport = require("passport");
const sendMail = require("../mail/mail");
const usersRouter = express.Router();

usersRouter.post("/login", (req, res, next) => {
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
      return res.redirect("/");
    });
    // req.session.passport = { user: user.id }; // 직접 세션에 사용자 정보 저장
    return res.redirect("/");
  })(req, res, next);
});

usersRouter.post("/logout", (req, res, next) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

usersRouter.post("/signup", async (req, res) => {
  //유저 객체 생성
  const user = new User(req.body);
  try {
    // 유저 컬렉션에 유저를 저장한다
    await user.save();
    //이메일 보내기
    sendMail("deswaq789@naver.com", "변경원", "welcome");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

usersRouter.get("/google", passport.authenticate("google"));

usersRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

usersRouter.get("/kakao", passport.authenticate("kakao"));

usersRouter.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

module.exports = usersRouter;
