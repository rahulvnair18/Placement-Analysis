const mongoose = require("mongoose");

// This blueprint stores a record of a test that an HOD has scheduled for a classroom.
// Think of it as an "event ticket" with a fixed start and end time.
const scheduledTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Placement Mock Test",
    },
    // Link to the HOD who created this test schedule.
    hodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Link to the specific classroom this test is for.
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    // The exact date and time the test becomes available.
    startTime: {
      type: Date,
      required: true,
    },
    // The exact date and time the test will automatically close.
    endTime: {
      type: Date,
      required: true,
    },
    // We can add more details later, like a specific set of questionIds.
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields.
    timestamps: true,
  }
);

const ScheduledTest = mongoose.model("ScheduledTest", scheduledTestSchema);

module.exports = ScheduledTest;
