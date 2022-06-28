const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (token === null) return res.send({success: false, msg: "Not authorized."})

    jwt.verify(token, String(process.env.TOKEN_SECRET), (err, user) => {
        console.log(err);

        if (err) return res.send({success: false, msg: "Token invalid.", err: "tkninv"})

        User.findOne({
            email: user.data,
        }).then(user => {
            req.user = user;
            next();
        }).catch(err => {
            console.log(err);
        })
    })
}

module.exports = authenticateToken;