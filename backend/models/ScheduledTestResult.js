const mongoose = require("mongoose");

const scheduledTestResultSchema = new mongoose.Schema(
  {
    scheduledTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledTest",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    answers: {
      type: Object,
      required: true,
    },
    // --- THIS IS THE NEW FIELD ---
    // It will store the reason if the test was auto-submitted.
    // e.g., "Tab Switched"
    malpracticeReason: {
      type: String,
      default: null, // Defaults to null if it was a normal submission
    },
  },
  {
    timestamps: true,
  }
);

const ScheduledTestResult = mongoose.model(
  "ScheduledTestResult",
  scheduledTestResultSchema
);

module.exports = ScheduledTestResult;
