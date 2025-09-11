const mongoose = require("mongoose");
const resultSchema = new mongoose.Schema();
({
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
    type: Map,
    of: String,
    required: true,
  },
}),
  {
    // This automatically adds `createdAt` and `updatedAt` fields,
    // which are useful for tracking when the result was saved.
    timestamps: true,
  };
const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
