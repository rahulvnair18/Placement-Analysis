const Classroom = require("../models/classroom");
const User = require("../models/user");
const ScheduledTest = require("../models/scheduledTest");
const crypto = require("crypto");
const HodQuestion = require("../models/HodQuestion");
const ScheduledTestResult = require("../models/ScheduledTestResult");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Create classroom (already good)
const createClassroom = async (req, res) => {
  try {
    const { name, batch } = req.body;
    const hodId = req.user._id;

    if (!name || !batch) {
      return res
        .status(400)
        .json({ message: "Classroom name and batch are required." });
    }

    // --- THIS IS THE UPGRADED VALIDATION LOGIC ---
    // It now checks if a classroom exists where EITHER the name OR the batch is the same.
    const existingClassroom = await Classroom.findOne({
      hodId: hodId,
      $or: [{ name: name }, { batch: batch }],
    });

    // If a duplicate is found, send a specific error message.
    if (existingClassroom) {
      // Check which field was the duplicate to give a better error message
      const duplicateField = existingClassroom.name === name ? "name" : "batch";
      return res.status(409).json({
        message: `A classroom with this ${duplicateField} already exists.`,
      });
    }
    // --- END OF UPGRADED LOGIC ---

    const randomString = crypto.randomBytes(3).toString("hex").toUpperCase();
    const joinCode = `C-${randomString}`;
    const newClassroom = new Classroom({ name, batch, hodId, joinCode });
    await newClassroom.save();

    res.status(201).json({
      message: "Classroom created successfully!",
      classroom: newClassroom,
    });
  } catch (error) {
    console.error("Error creating classroom:", error);
    res.status(500).json({ message: "Server error creating classroom." });
  }
};
// Delete classroom
const deleteClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const hodId = req.user._id;

    const classroom = await Classroom.findOne({ _id: classroomId, hodId });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or you are not authorized." });
    }

    await Classroom.deleteOne({ _id: classroomId });
    res.status(200).json({ message: "Classroom deleted successfully." });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    res.status(500).json({ message: "Server error deleting classroom." });
  }
};
// Get all classrooms for HOD
const getMyClassrooms = async (req, res) => {
  try {
    const hodId = req.user._id;
    const classrooms = await Classroom.find({ hodId }).sort({ createdAt: -1 });
    res.status(200).json(classrooms);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    res.status(500).json({ message: "Server error fetching classrooms." });
  }
};

// Get classroom details
const getClassroomDetails = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const hodId = req.user._id;

    const classroom = await Classroom.findById(classroomId).populate(
      "students",
      "fullName rollNo"
    );

    if (!classroom || classroom.hodId.toString() !== hodId.toString()) {
      return res.status(404).json({
        message: "Classroom not found or you are not authorized to view it.",
      });
    }

    res.status(200).json(classroom);
  } catch (error) {
    console.error("Error fetching classroom details:", error);
    res
      .status(500)
      .json({ message: "Server error fetching classroom details." });
  }
};

// --- 🔥 NEW FUNCTION ---
// Regenerate classroom join code
const regenerateClassroomCode = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const hodId = req.user._id;

    // Ensure the classroom exists and belongs to this HOD
    const classroom = await Classroom.findById(classroomId);
    if (!classroom || classroom.hodId.toString() !== hodId.toString()) {
      return res.status(404).json({
        message: "Classroom not found or you are not authorized to modify it.",
      });
    }

    // Generate new code
    const randomString = crypto.randomBytes(3).toString("hex").toUpperCase();
    classroom.joinCode = `C-${randomString}`;
    await classroom.save();

    res.status(200).json({
      message: "Classroom join code regenerated successfully!",
      joinCode: classroom.joinCode,
    });
  } catch (error) {
    console.error("Error regenerating classroom code:", error);
    res
      .status(500)
      .json({ message: "Server error regenerating classroom code." });
  }
};
// --- NEW: Function to remove a student from a classroom ---
const removeStudentFromClassroom = async (req, res) => {
  try {
    const { classroomId, studentId } = req.params;
    const hodId = req.user._id;

    // Security check: ensure the HOD owns this classroom
    const classroom = await Classroom.findOne({ _id: classroomId, hodId });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or you are not authorized." });
    }

    // Use MongoDB's $pull operator to remove the studentId from the 'students' array
    // This is the most efficient way to remove an item from an array in the database.
    await Classroom.updateOne(
      { _id: classroomId },
      { $pull: { students: studentId } }
    );

    res.status(200).json({ message: "Student removed successfully." });
  } catch (error) {
    console.error("Error removing student:", error);
    res.status(500).json({ message: "Server error removing student." });
  }
};
// --- NEW: Function to schedule a test for a classroom ---
const scheduleTest = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { title, startTime, endTime } = req.body;
    const hodId = req.user._id;

    // 1. Validate the input from the HOD's form.
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        message: "Test title, start time, and end time are required.",
      });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res
        .status(400)
        .json({ message: "End time must be after the start time." });
    }

    // 2. Security Check: Ensure the HOD owns this classroom before scheduling a test for it.
    const classroom = await Classroom.findOne({ _id: classroomId, hodId });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or you are not authorized." });
    }

    // 3. Create the new "event ticket" document.
    const newScheduledTest = new ScheduledTest({
      title,
      startTime,
      endTime,
      classroomId,
      hodId,
    });

    await newScheduledTest.save();

    // 4. Send a success confirmation back.
    res
      .status(201)
      .json({ message: `Test "${title}" scheduled successfully.` });
  } catch (error) {
    console.error("Error scheduling test:", error);
    res.status(500).json({ message: "Server error scheduling test." });
  }
};
const getScheduledTestsForClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const hodId = req.user._id;

    // Security Check: First, ensure the HOD owns the classroom they're asking about.
    const classroom = await Classroom.findOne({ _id: classroomId, hodId });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or you are not authorized." });
    }

    // Find all tests in the 'scheduledtests' collection that match this classroomId
    const scheduledTests = await ScheduledTest.find({ classroomId }).sort({
      startTime: 1,
    }); // Sort by start time, showing upcoming tests first

    res.status(200).json(scheduledTests);
  } catch (error) {
    console.error("Error fetching scheduled tests:", error);
    res.status(500).json({ message: "Server error fetching scheduled tests." });
  }
};
const addQuestionsToHodBank = async (req, res) => {
  const { category, count } = req.body;
  const hodId = req.user._id;

  if (!category || !count || count <= 0) {
    return res.status(400).json({
      message:
        "Please provide a valid category and a positive number of questions.",
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    }); // Using a fast model

    const prompt = `
      Generate exactly ${count} high-quality, multiple-choice questions for a competitive placement test, formatted as a valid JSON array.
      CRITICAL RULE: All questions in this batch MUST belong to the following section: "${category}".
      Each question object must contain ONLY these fields: "section", "questionText", "options" (an array of 4 strings), "correctAnswer", and "explanation".
      Ensure all quotation marks within string values are properly escaped (e.g., \\"). Do not include any text, backticks, or markdown before or after the JSON array.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // This is the corrected code
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Add this line to remove bad control characters
    const sanitizedJsonString = cleanedText.replace(
      /[\x00-\x1F\x7F-\x9F]/g,
      ""
    );

    const questionsFromAI = JSON.parse(sanitizedJsonString);

    // --- The most important step for the HOD ---
    // Add the hodId to every question generated by the AI
    const questionsWithHodId = questionsFromAI.map((q) => ({
      ...q,
      hodId: hodId,
    }));

    // Save the questions to the HOD's private collection
    const savedQuestions = await HodQuestion.insertMany(questionsWithHodId);

    res.status(201).json({
      message: `Successfully added ${savedQuestions.length} new ${category} questions to your bank.`,
    });
  } catch (error) {
    console.error("Failed to add HOD questions to bank:", error);
    res
      .status(500)
      .json({ message: `Error adding questions: ${error.message}` });
  }
};
const getHodQuestionStats = async (req, res) => {
  try {
    const stats = await HodQuestion.aggregate([
      { $match: { hodId: req.user._id } }, // Only match questions for the logged-in HOD
      { $group: { _id: "$section", count: { $sum: 1 } } }, // Group by section and count them
    ]);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching HOD question stats:", error);
    res.status(500).json({ message: "Server error fetching stats." });
  }
};
const getTestAnalysisForHOD = async (req, res) => {
  try {
    const { scheduledTestId } = req.params;
    const hodId = req.user._id;

    // 1. Security Check (Unchanged)
    const scheduledTest = await ScheduledTest.findById(scheduledTestId);
    if (!scheduledTest || scheduledTest.hodId.toString() !== hodId.toString()) {
      return res.status(404).json({
        message: "Scheduled test not found or you are not authorized.",
      });
    }

    // 2. Get the full student roster (Populate _id as well)
    const classroom = await Classroom.findById(scheduledTest.classroomId)
      .select("students")
      .populate("students", "fullName _id"); // Ensure _id is populated
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Associated classroom not found." });
    }
    const fullRoster = classroom.students;

    // 3. Get all results submitted for this test
    const allResults = await ScheduledTestResult.find({
      scheduledTestId,
    }).populate("studentId", "fullName _id");

    // --- 4. NEW LOGIC: Categorize all students who submitted a result ---
    const attemptedStudents = [];
    const malpracticedStudents = [];
    const attemptedStudentIds = new Set(); // To track everyone who submitted

    allResults.forEach((result) => {
      attemptedStudentIds.add(result.studentId._id.toString());

      const studentData = {
        studentId: result.studentId._id,
        name: result.studentId.fullName,
        score: result.score,
        totalMarks: result.totalMarks,
      };

      if (result.malpracticeReason) {
        // If there's a reason, add them to the malpractice list
        malpracticedStudents.push({
          ...studentData,
          reason: result.malpracticeReason,
        });
      } else {
        // Otherwise, add them to the normally attempted list
        attemptedStudents.push(studentData);
      }
    });

    // 5. Find students who did not attempt the test
    const notAttemptedStudents = fullRoster.filter(
      (student) => !attemptedStudentIds.has(student._id.toString())
    );

    // 6. Sort the normally attempted students by score to find the topper
    attemptedStudents.sort((a, b) => b.score - a.score);
    const topper = attemptedStudents.length > 0 ? attemptedStudents[0] : null;

    // 7. Send the complete, categorized data package to the frontend
    res.status(200).json({
      testTitle: scheduledTest.title,
      attemptedStudents,
      notAttemptedStudents,
      malpracticedStudents, // <-- The new, separate list
      topper,
    });
  } catch (error) {
    console.error("Error fetching HOD test analysis:", error);
    res.status(500).json({ message: "Server error fetching test analysis." });
  }
};
// Add this entire new function to hodController.js

const getStudentResultForHOD = async (req, res) => {
  try {
    const { scheduledTestId, studentId } = req.params;
    const hodId = req.user._id;

    // 1. Security Check: Verify the HOD owns the test.
    const scheduledTest = await ScheduledTest.findById(scheduledTestId);
    if (!scheduledTest || scheduledTest.hodId.toString() !== hodId.toString()) {
      return res
        .status(404)
        .json({ message: "Test not found or you are not authorized." });
    }

    // 2. Find the specific student's result for that specific test.
    const result = await ScheduledTestResult.findOne({
      scheduledTestId,
      studentId,
    }).lean();
    if (!result) {
      return res
        .status(404)
        .json({ message: "No result found for this student on this test." });
    }

    // 3. Get the questions from the HOD's private bank to perform the analysis.
    const questionIds = Object.keys(result.answers);
    const questions = await HodQuestion.find({
      _id: { $in: questionIds },
    }).lean();

    // 4. Perform the analysis (same logic as the student's view).
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
    }));

    // 5. Send the complete data package back.
    res.status(200).json({
      score: result.score,
      totalMarks: result.totalMarks,
      createdAt: result.createdAt,
      analysis: analysisData,
      sectionScores,
      sectionTotals,
    });
  } catch (error) {
    console.error("Error fetching student result for HOD:", error);
    res.status(500).json({ message: "Server error fetching student result." });
  }
};
const removeHodQuestions = async (req, res) => {
  const { section } = req.body; // section is optional
  const hodId = req.user._id;

  try {
    // Base filter always ensures HOD can only delete their own questions
    const filter = { hodId: hodId };

    // If a specific section is provided, add it to the filter
    if (section) {
      filter.section = section;
    }

    // Use deleteMany to remove all documents matching the filter
    const result = await HodQuestion.deleteMany(filter);

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No matching questions found to delete." });
    }

    const message = section
      ? `Successfully deleted ${result.deletedCount} questions from the ${section} section.`
      : `Successfully deleted all ${result.deletedCount} questions from your bank.`;

    res.status(200).json({ message });
  } catch (error) {
    console.error("Error removing HOD questions:", error);
    res.status(500).json({ message: "Server error while removing questions." });
  }
};

module.exports = {
  removeHodQuestions,
  getStudentResultForHOD,
  getTestAnalysisForHOD,
  getHodQuestionStats,
  addQuestionsToHodBank,
  createClassroom,
  getMyClassrooms,
  getClassroomDetails,
  regenerateClassroomCode,
  getScheduledTestsForClassroom,
  removeStudentFromClassroom,
  scheduleTest,
  deleteClassroom, // ✅ add this
};
