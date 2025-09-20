const mongoose = require("mongoose");

// This blueprint stores a record of a test that an HOD has scheduled for a classroom.
const scheduledTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Placement Mock Test",
    },
    hodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    // We can add more details later, like a specific set of questionIds
    // or a duration override.
  },
  {
    timestamps: true,
  }
);

const ScheduledTest = mongoose.model("ScheduledTest", scheduledTestSchema);

module.exports = ScheduledTest;
