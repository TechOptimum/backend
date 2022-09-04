const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    origin: ["http://localhost:3001"],
  })
);

app.use("/auth", authRoutes);
app.use("/course", courseRoutes);

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
