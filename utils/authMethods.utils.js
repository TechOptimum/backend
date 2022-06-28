const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

// token methods
const token = (email) => {
  const payload = {
    data: email,
  };
  return new Promise((reject, resolve) => {
    jwt.sign(
      payload,
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1hr",
      },
      function (err, tokenVal) {
        if (err) resolve(err);
        else reject(tokenVal);
      }
    );
  });
};

exports.generateAccessToken = async (email) => {
  return await token(email);
};

// password methods
exports.hashPassword = async (pwd) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(pwd, salt);
};

exports.checkPassword = async (correctPwd, pwd) => {
  return bcrypt.compare(pwd, correctPwd);
};