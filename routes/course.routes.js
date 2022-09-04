const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

const courseControllers = require("../controllers/course.controllers");

router.post("/new-course", authenticateToken, courseControllers.postCreateCourseController);

module.exports = router;