const express = require("express");
const router = express.Router();
const answerController = require("../controllers/answerController");
const authMiddleware = require("../middleware/authMiddleware");

// Vote on answer
router.post("/:id/vote", authMiddleware, answerController.voteAnswer);

// Accept answer
router.post("/:id/accept", authMiddleware, answerController.acceptAnswer);

module.exports = router;
