const express = require("express");
const { body } = require("express-validator/check");

const router = express.Router();

const authControllers = require("../controllers/auth.controllers");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .contains("[0-9]")
      .withMessage("Password must contain a number")
      .contains("[a-z]")
      .withMessage("Password must contain a lowercase letter")
      .contains("[A-Z]")
      .withMessage("Password must contain an uppercase letter")
      .contains("[@$!%*#?&]")
      .withMessage("Password must contain a special character"),
    body("confirmPassword")
      .matches(req.body.password)
      .withMessage("Passwords must match"),
  ],
  authControllers.postRegisterController
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authControllers.postLoginController
);

router.post("/logout", authControllers.postLogoutController);

router.get("/verify", [], authControllers.getVerifyController);

router.post("/reset-password-request", [], authControllers.postFPassReq);

router.post("/reset-password", [], authControllers.postResetPassword);

module.exports = router;
