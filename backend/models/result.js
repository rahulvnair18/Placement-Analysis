const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
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
    }, // --- THE FIX --- // We are changing the type from 'Map' to a generic 'Object'. // This perfectly matches the { "questionId": "answer" } structure // that we are sending from the controller.
    answers: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
