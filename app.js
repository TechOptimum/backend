const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const notionRoutes = require("./routes/notion.routes");

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    origin: ["http://localhost:3000"],
  })
);

app.use("/auth", authRoutes);
app.use("/course", courseRoutes);
app.use("/notion", notionRoutes);

// mongoose
//   .connect("mongodb://localhost:27017/techoptimumdasboard")
//   .then((result) => {
    
//   })
//   .catch((err) => {
//     console.log(err);
//   });

app.listen(3001, () => {
  console.log("Connected!");
});