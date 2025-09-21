// We need all three models to connect the data
const Result = require("../models/result");
const Question = require("../models/question");
const TestSession = require("../models/testSession");
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
const getResultDetails = async (req, res) => {
  try {
    const { resultId } = req.params;
    const studentId = req.user._id;

    const result = await Result.findById(resultId).lean();
    if (!result || result.studentId.toString() !== studentId.toString()) {
      return res
        .status(404)
        .json({ message: "Result not found or you are not authorized." });
    }

    // --- THE FIX: Add a defensive check here ---
    if (!result.answers || Object.keys(result.answers).length === 0) {
      return res.status(200).json({
        score: result.score,
        totalMarks: result.totalMarks,
        createdAt: result.createdAt,
        analysis: [],
        sectionScores: {},
        sectionTotals: {},
      });
    }

    const questionIds = Object.keys(result.answers);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    // --- THE FIX: Calculate section-wise scores ---
    const sectionScores = {};
    const sectionTotals = {};

    // This loop will build our two new objects
    questions.forEach((question) => {
      const section = question.section;
      // Initialize counters for a new section if they don't exist
      if (!sectionScores[section]) sectionScores[section] = 0;
      if (!sectionTotals[section]) sectionTotals[section] = 0;

      // Increment the total number of questions for this section
      sectionTotals[section]++;

      // Check if the student's answer was correct and increment the score for this section
      if (result.answers[question._id.toString()] === question.correctAnswer) {
        sectionScores[section]++;
      }
    });

    const analysisData = questions.map((question) => ({
      _id: question._id,
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      studentAnswer: result.answers[question._id.toString()] || "Not Attempted",
      isCorrect:
        result.answers[question._id.toString()] === question.correctAnswer,
    }));

    // We now send the complete data package with the filled-in section scores
    res.status(200).json({
      score: result.score,
      totalMarks: result.totalMarks,
      createdAt: result.createdAt,
      analysis: analysisData,
      sectionScores, // <-- Now contains real data, e.g., { Quantitative: 7 }
      sectionTotals, // <-- Now contains real data, e.g., { Quantitative: 10 }
    });
  } catch (error) {
    console.error("Error fetching result details:", error);
    res.status(500).json({ message: "Server error fetching result details." });
  }
};

const getMyResultsHistory = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find all results belonging to this student.
    // .sort({ createdAt: -1 }) gets the newest tests first.
    // .select() limits the data sent to only what's needed for the list.
    // .lean() makes the query faster and more reliable.
    const results = await Result.find({ studentId })
      .sort({ createdAt: -1 })
      .select("score totalMarks createdAt")
      .lean();

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching results history:", error);
    res.status(500).json({ message: "Server error fetching results history." });
  }
};
module.exports = {
  submitTest,
  getResultDetails,
  getMyResultsHistory,
};
