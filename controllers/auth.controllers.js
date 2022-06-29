const nodeMailer = require("nodemailer");

const User = require("../models/user.model");

const generateToken = require("../utils/authMethods.utils").generateAccessToken;
const hashPassword = require("../utils/authMethods.utils").hashPassword;
const checkPassword = require("../utils/authMethods.utils").checkPassword;

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

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
                    console.log("remove this later");
                    const host = req.get("host");
                    const link = `http://${host}/verify?token=${verifyToken}`;
                    const mailOptions = {
                      from: "noreply@techoptimum.org",
                      to: email,
                      subject: "Verify your email",
                      html: `<h1>Verify your email</h1><br><a href="${link}">Click here to verify your email</a>`,
                    };
                    transporter.sendMail(mailOptions, (err, info) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(info);
                      }
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
      if (users.active === false) {
        users.active = true;
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
