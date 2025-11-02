// We need all three models to connect the data
const Result = require("../models/result");
const Question = require("../models/question");
const TestSession = require("../models/testSession");
const mongoose = require("mongoose");
const ScheduledTestResult = require("../models/ScheduledTestResult");
const HodQuestion = require("../models/HodQuestion");
const submitTest = async (req, res) => {
  try {
    const studentId = req.user._id; // We now look for an optional 'scheduledTestId' in the request
    const { answers, testSessionId, scheduledTestId } = req.body;

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
    let score = 0;
    let totalMarks = 0; // --- LOGIC SWITCH: Check if it's a scheduled test or a mock test ---

    if (scheduledTestId) {
      // --- THIS IS A SCHEDULED TEST ---
      console.log("Processing a SCHEDULED test submission..."); // 1. Grade against the HOD's private question bank

      const correctAnswers = await HodQuestion.find({
        _id: { $in: questionIds },
      }).select("_id correctAnswer");

      totalMarks = correctAnswers.length;
      const correctAnswerMap = new Map();
      correctAnswers.forEach((answer) => {
        correctAnswerMap.set(answer._id.toString(), answer.correctAnswer);
      });

      for (const questionId in answers) {
        if (correctAnswerMap.get(questionId) === answers[questionId]) {
          score++;
        }
      } // 2. Save the result to the NEW ScheduledTestResult collection

      const newResult = new ScheduledTestResult({
        scheduledTestId,
        studentId,
        score,
        totalMarks,
        answers,
      });
      const savedResult = await newResult.save();

      res.status(201).json({
        message: "Scheduled Test submitted successfully!",
        resultId: savedResult._id,
      });
    } else {
      // --- THIS IS A MOCK TEST (Original Logic) ---
      console.log("Processing a MOCK test submission..."); // 1. Grade against the main global question bank

      const correctAnswers = await Question.find({
        _id: { $in: questionIds },
      }).select("_id correctAnswer");

      totalMarks = correctAnswers.length;
      const correctAnswerMap = new Map();
      correctAnswers.forEach((answer) => {
        correctAnswerMap.set(answer._id.toString(), answer.correctAnswer);
      });

      for (const questionId in answers) {
        if (correctAnswerMap.get(questionId) === answers[questionId]) {
          score++;
        }
      } // 2. Save the result to the original Result collection

      const newResult = new Result({
        studentId,
        score,
        totalMarks,
        answers,
      });
      const savedResult = await newResult.save();

      res.status(201).json({
        message: "Mock Test submitted successfully!",
        resultId: savedResult._id,
      });
    }
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
    } // --- THE FIX: Add a defensive check here ---

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
    const questions = await Question.find({ _id: { $in: questionIds } }).lean(); // --- THE FIX: Calculate section-wise scores ---

    const sectionScores = {};
    const sectionTotals = {}; // This loop will build our two new objects

    questions.forEach((question) => {
      const section = question.section; // Initialize counters for a new section if they don't exist
      if (!sectionScores[section]) sectionScores[section] = 0;
      if (!sectionTotals[section]) sectionTotals[section] = 0; // Increment the total number of questions for this section

      sectionTotals[section]++; // Check if the student's answer was correct and increment the score for this section

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
    })); // We now send the complete data package with the filled-in section scores

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
    const studentId = req.user._id; // Find all results belonging to this student. // .sort({ createdAt: -1 }) gets the newest tests first. // .select() limits the data sent to only what's needed for the list. // .lean() makes the query faster and more reliable.

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
// Add this new function to your resultController.js file

const getScheduledResultDetails = async (req, res) => {
  try {
    const { resultId } = req.params;
    const studentId = req.user._id; // 1. Look in the NEW ScheduledTestResult collection

    const result = await ScheduledTestResult.findById(resultId).lean();
    if (!result || result.studentId.toString() !== studentId.toString()) {
      return res
        .status(404)
        .json({ message: "Result not found or you are not authorized." });
    } // This is the corrected code

    if (!result.answers || Object.keys(result.answers).length === 0) {
      return res.status(200).json({
        score: result.score,
        totalMarks: result.totalMarks,
        createdAt: result.createdAt,
        analysis: [],
        sectionScores: {}, // <-- ADD THIS
        sectionTotals: {}, // <-- ADD THIS
      });
    }

    const questionIds = Object.keys(result.answers); // 2. Get the questions from the HOD's private question bank

    const questions = await HodQuestion.find({
      _id: { $in: questionIds },
    }).lean(); // 3. Perform the analysis (This logic is the same as before)

    const sectionScores = {};
    const sectionTotals = {};

    questions.forEach((question) => {
      const section = question.section;
      if (!sectionScores[section]) sectionScores[section] = 0;
      if (!sectionTotals[section]) sectionTotals[section] = 0;
      sectionTotals[section]++;
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
    })); // 4. Send the complete data package back

    res.status(200).json({
      score: result.score,
      totalMarks: result.totalMarks,
      createdAt: result.createdAt,
      analysis: analysisData,
      sectionScores,
      sectionTotals,
    });
  } catch (error) {
    console.error("Error fetching scheduled result details:", error);
    res.status(500).json({ message: "Server error fetching result details." });
  }
};
module.exports = {
  submitTest,
  getResultDetails,
  getMyResultsHistory,
  getScheduledResultDetails,
};
