const express = require("express");
const router = express.Router();
const { submitTest } = require("../controllers/resultController");
const { protect } = require("../middleware/authMiddleware");

// Define the "Submission Mailbox" endpoint.
// When a POST request is made to '/api/results/submit', this route will be triggered.
// 1. The 'protect' middleware runs first to verify the student's JWT.
// 2. If the token is valid, the 'submitTest' controller function is executed.
router.post("/submit", protect, submitTest);

// We will add another route here later for fetching a specific result for the analysis page.

module.exports = router;
