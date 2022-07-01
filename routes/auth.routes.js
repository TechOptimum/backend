const express = require('express');

const router = express.Router();

const authControllers = require('../controllers/auth.controllers');

router.post('/register', authControllers.postRegisterController);

router.post('/login', authControllers.postLoginController);

router.post('/logout', authControllers.postLogoutController);

router.get('/verify', authControllers.getVerifyController);

router.post('/reset-password-request', authControllers.postFPassReq);

router.post('/reset-password', authControllers.postResetPassword);

module.exports = router;