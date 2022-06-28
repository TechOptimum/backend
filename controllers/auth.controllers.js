const User = require("../models/user.model");

const generateToken = require("../utils/authMethods.utils").generateAccessToken;
const hashPassword = require("../utils/authMethods.utils").hashPassword;
const checkPassword = require("../utils/authMethods.utils").checkPassword;

exports.postLoginController = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const paramsExist = Object.keys(req.query).length > 0;
  if (!paramsExist) {
    User.findOne({
      email,
    })
      .then((users) => {
        checkPassword(users.password, password).then((result) => {
          if (result) {
            generateToken(email)
              .then((token) => {
                return res
                  .cookie("token", token, {
                    maxAge: 1000 * 60 * 60,
                    httpOnly: true,
                    signed: true,
                  })
                  .status(200)
                  .json({ success: true, username: users.username });
              })
              .catch((err) => {
                console.log(err);
                return res.status(505).json({
                  success: false,
                  errType: "tkngenerr",
                  msg: "Internal Server Error.",
                });
              });
          } else {
            return res.status(422).json({
              success: false,
              msg: "Invalid email or password.",
              errType: "lgnfail",
            });
          }
        });
      })
      .catch((err) => {
        res.status(505).json({
          success: false,
          msg: "Internal Server Error.",
          errType: "dberr",
        });
        console.log(err);
      });
  }
};

exports.postRegisterController = (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password === confirmPassword) {
    hashPassword(password).then((hashedPass) => {
      generateToken(email)
        .then((token) => {
          User.find({
            email: email,
          })
            .then((users) => {
              if (users.length > 0) {
                return res.status(422).json({
                  success: false,
                  msg: "Email already exists.",
                  errType: "emalex",
                });
              } else {
                const user = new User({
                  username,
                  email,
                  password: hashedPass,
                });
                user
                  .save()
                  .then((result) => {
                    return res
                      .cookie("token", token, {
                        maxAge: 1000 * 60 * 60,
                        signed: true,
                        httpOnly: true,
                      })
                      .status(200)
                      .json({
                        success: true,
                        username,
                      });
                  })
                  .catch((err) => {
                    res.status(505).json({
                      msg: "There was a problem, try again later.",
                      errType: "dberr",
                    });
                    console.log(err);
                  });
              }
            })
            .catch((err) => {
              console.log(err);
              return res.status(505).json({
                success: false,
                errType: "dberr",
                msg: "Internal Server Error.",
              });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(505).json({
            success: false,
            errType: "tkngenerr",
            msg: "Internal Server Error.",
          });
        });
    });
  } else {
    res.status(422).json({
      success: false,
      msg: "Passwords don't match.",
      errType: "pwdmm",
    });
  }
};

exports.postLogoutController = (req, res) => {
  res.clearCookie("token").status(200).json({ success: true });
};
