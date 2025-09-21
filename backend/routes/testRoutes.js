const express = require("express");
const router = express.Router();
const {
  startTest,
  startScheduledTest,
} = require("../controllers/testController");
const { protect } = require("../middleware/authMiddleware");

// This is the new, primary endpoint for students to start a test.
// It is protected to ensure only logged-in users can access it.
router.post("/start-mock", protect, startTest);
router.post("/start-scheduled/:scheduledTestId", protect, startScheduledTest);
module.exports = router;
