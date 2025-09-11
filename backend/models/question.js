const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: ["Quantitative", "Reasoning", "English", "Programming", "DSA"],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length === 4,
        message: "A question must have exactly 4 options.",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    // --- NEW FIELD ---
    // Added a field to store the detailed solution for the question.
    explanation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
