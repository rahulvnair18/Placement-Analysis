const mongoose = require("mongoose");

const hodQuestionSchema = new mongoose.Schema(
  {
    // --- THIS IS THE NEW, CRUCIAL FIELD ---
    // A direct link to the HOD who owns this question.
    hodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    explanation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const HodQuestion = mongoose.model("HodQuestion", hodQuestionSchema);
module.exports = HodQuestion;
