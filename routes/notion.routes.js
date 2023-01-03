const notionControllers = require("../controllers/notion.controller");
const express = require("express");
const router = express.Router();

router.get("/", [], notionControllers.readInternshipFinderData);

module.exports = router;
