const sgMail = require("@sendgrid/mail");

const User = require("../models/user.model");

const generateToken = require("../utils/authMethods.utils").generateAccessToken;
const hashPassword = require("../utils/authMethods.utils").hashPassword;
const checkPassword = require("../utils/authMethods.utils").checkPassword;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
                  .json({
                    success: true,
                    username: users.username,
                    active: users.active,
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
  const verifyToken = require("crypto").randomBytes(64).toString("hex");

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
                  active: false,
                  token: verifyToken,
                });
                user
                  .save()
                  .then((result) => {
                    const link = `http://localhost:3001/verify/${verifyToken}`;
                    const msg = {
                      to: email,
                      from: process.env.FROM_EMAIL,
                      subject: "Verify your Tech Optimum Account",
                      html: `<h1>Verify your Tech Optimum Account.</h1><br><a href="${link}">Click here to verify your email.</a><br><br><h3>Sincerely, Tech Optimum</h3>`,
                    };
                    sgMail
                      .send(msg)
                      .then((result) => {
                        console.log("Email sent.");
                      })
                      .catch((err) => {
                        console.log(err);
                      });
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
                        active: false,
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

exports.getVerifyController = (req, res) => {
  const token = req.query.token;
  User.findOne({
    token: token,
  })
    .then((users) => {
      if (users.length < 1) {
        return res.json({
          success: false,
          msg: "Token not recognized.",
          errType: "tknnr",
        });
      }
      if (users.active === false) {
        users.active = true;
        users.token = null;
        users
          .save()
          .then((result) => {
            return res.status(200).json({
              success: true,
              msg: "Email verified.",
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(505).json({
              success: false,
              errType: "dberr",
              msg: "Internal Server Error.",
            });
          });
      } else {
        return res.status(200).json({
          success: true,
          msg: "Email already verified.",
          code: "emav",
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
};

exports.postFPassReq = (req, res) => {
  const email = req.body.email;
  const verifyToken = require("crypto").randomBytes(64).toString("hex");
  User.findOne({ email }).then((users) => {
    if (!users) {
      return res.json({
        success: false,
        code: "emalnex",
      });
    } else {
      users.token = verifyToken;
      users.save().then((result) => {
        const link = `http://localhost:3001/verify/reset-password/${verifyToken}`;
        const msg = {
          to: email,
          from: process.env.FROM_EMAIL,
          subject: "Password Reset Requested.",
          html: `<h1>You requested a password reset.</h1><br><a href="${link}">Click here to continue.</a><br><br><h3>Sincerely, Tech Optimum</h3>`,
        };
        sgMail
          .send(msg)
          .then((result) => {
            console.log("Email sent.");
          })
          .catch((err) => {
            console.log(err);
          });
        return;
      }).then(() => {
        res.json({
          success: true,
        });
      })
    }
  });
};

exports.postResetPassword = (req, res) => {
  const token = req.query.token;
  const password = req.body.password;
  User.findOne({
    token,
  }).then((user) => {
    if (!user) {
      return res.json({
        success: false,
        code: "nuf",
      });
    } else {
      if (user.token.toString() === token.toString()) {
        hashPassword(password)
          .then((hashedPassword) => {
            user.password = hashedPassword;
            user.token = null;
            return user.save();
          })
          .then((result) => {
            const msg = {
              to: user.email,
              from: process.env.FROM_EMAIL,
              subject: "Password Reset Successful.",
              html: `<h1>Your password was reset successfully.</h1><br><br><h3>Sincerely, Tech Optimum</h3>`,
            };
            sgMail
              .send(msg)
              .then((result) => {
                console.log("Email sent.");
              })
              .catch((err) => {
                console.log(err);
              });
            return res.json({ success: true, msg: "Password changed." });
          });
      }
    }
  });
};
