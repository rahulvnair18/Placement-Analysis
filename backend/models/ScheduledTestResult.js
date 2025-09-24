const mongoose = require("mongoose");

const scheduledTestResultSchema = new mongoose.Schema(
  {
    // --- THIS IS THE NEW, CRUCIAL FIELD ---
    // A direct link to the scheduled test event this result belongs to.
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
