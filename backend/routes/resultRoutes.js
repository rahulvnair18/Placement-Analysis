const express = require("express");
const router = express.Router();
const {
  submitTest,
  getResultDetails,
  getMyResultsHistory, // <-- 1. Import the new function
} = require("../controllers/resultController");
const { protect } = require("../middleware/authMiddleware");

// Route for submitting a test (POST /api/results/submit)
router.post("/submit", protect, submitTest);

// --- 2. ADD THE NEW ROUTE HERE ---
// Route for fetching the logged-in student's test history (GET /api/results/my-history)
// This MUST come BEFORE the '/:resultId' route to work correctly.
router.get("/my-history", protect, getMyResultsHistory);

// Route for fetching a single result by its ID (GET /api/results/some_id)
router.get("/:resultId", protect, getResultDetails);

module.exports = router;
