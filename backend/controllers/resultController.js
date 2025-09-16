// We need all three models to connect the data
const Result = require("../models/result");
const TestSession = require("../models/testSession");
const Question = require("../models/question");
const mongoose = require("mongoose");

const submitTest = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { answers, testSessionId } = req.body;

    if (!answers || !testSessionId) {
      return res
        .status(400)
        .json({ message: "Missing answers or session ID." });
    }

    const session = await TestSession.findById(testSessionId);
    if (!session || session.studentId.toString() !== studentId.toString()) {
      return res
        .status(403)
        .json({ message: "Invalid or unauthorized test session." });
    }

    const questionIds = session.questionIds;
    const correctAnswers = await Question.find({
      _id: { $in: questionIds },
    }).select("_id correctAnswer");

    let score = 0;
    const totalMarks = correctAnswers.length;

    const correctAnswerMap = new Map();
    correctAnswers.forEach((answer) => {
      correctAnswerMap.set(answer._id.toString(), answer.correctAnswer);
    });

    for (const questionId in answers) {
      const correctAnswer = correctAnswerMap.get(questionId);
      const studentAnswer = answers[questionId];
      if (correctAnswer && correctAnswer === studentAnswer) {
        score++;
      }
    }

    // --- DEBUGGING LOGS ---
    // Let's print the values of our variables right before we try to save them.
    // This will make the "ink" visible and show us exactly what's being saved.
    console.log("--- Preparing to Save Result ---");
    console.log("Student ID:", studentId);
    console.log("Final Score:", score);
    console.log("Total Marks:", totalMarks);
    console.log("Submitted Answers Object:", answers);
    console.log("---------------------------------");

    // 5. Save the final "Report Card" to the database.
    const newResult = new Result({
      studentId,
      score,
      totalMarks,
      answers,
    });

    const savedResult = await newResult.save();

    console.log(
      `Result saved for student ${studentId}. Score: ${score}/${totalMarks}`
    );

    res.status(201).json({
      message: "Test submitted successfully!",
      resultId: savedResult._id,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Server error during test submission." });
  }
};

module.exports = {
  submitTest,
};
