const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    minLength: 5,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
});

// userSchema.methods.comparePassword = function (plainPassword, cb) {
//   //bcrypt compare비교
//   // plainPassword는 클라이언트에서 온 패스워드임 . this.password는 데이터베이스에 있는 비밀번호
//   // 그래서 이 두개가 같으면 로그인~
//   if (plainPassword === this.password) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
//   return cb({ error: "error" });
// };

userSchema.methods.comparePassword = async function (plainPassword) {
  try {
    return await bcrypt.compare(plainPassword, this.password);
  } catch (error) {
    throw error;
  }
};
const saltRounds = 10;
userSchema.pre("save", function (next) {
  let user = this;
  //비밀번호가 변경될 때만
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
