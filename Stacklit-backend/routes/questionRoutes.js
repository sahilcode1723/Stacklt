const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/ask", authMiddleware, questionController.askQuestion);

module.exports = router;
