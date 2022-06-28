const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const authRoutes = require('./routes/auth.routes');

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  cors({
    origin: ["http://localhost:3001"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use('/auth', authRoutes);

mongoose
  .connect("mongodb://localhost:27017/techoptimumdasboard")
  .then((result) => {
    app.listen(3000, () => {
      console.log("Connected!");
    });
  })
  .catch((err) => {
    console.log(err);
  });
