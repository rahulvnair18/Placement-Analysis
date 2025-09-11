const express = require("express");
const router = express.Router();
const { getQuestions } = require("../controllers/questionController");
const { protect } = require("../middleware/authMiddleware");

// This is the correct configuration.
// It combines with "/api/questions" from your server.js to create the correct URL.
router.get("/", protect, getQuestions);

module.exports = router;
