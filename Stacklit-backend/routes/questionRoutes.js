const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const answerController = require("../controllers/answerController");
const authMiddleware = require("../middleware/authMiddleware");

// Correct POST answer route:
router.post("/:id/answers", authMiddleware, answerController.postAnswer);

router.post("/ask", authMiddleware, questionController.askQuestion);
router.get("/", questionController.getAllQuestions);
router.get("/:id", questionController.getQuestionById);

module.exports = router;
