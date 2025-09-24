const express = require("express");
const router = express.Router();
const {
  submitTest,
  getResultDetails,
  getMyResultsHistory,
  getScheduledResultDetails, // <-- 1. Import the new function
} = require("../controllers/resultController");
const { protect } = require("../middleware/authMiddleware");

// Route for submitting a test
router.post("/submit", protect, submitTest);

// Route for fetching the student's mock test history
router.get("/my-history", protect, getMyResultsHistory);

// --- 2. ADD THE NEW ROUTE FOR SCHEDULED RESULTS ---
// This route matches what the frontend is calling.
router.get("/scheduled-results/:resultId", protect, getScheduledResultDetails);

// Route for fetching a single MOCK result by its ID
router.get("/:resultId", protect, getResultDetails);

module.exports = router;
