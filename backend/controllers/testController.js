const Question = require("../models/question");
const TestSession = require("../models/testSession");
const ScheduledTest = require("../models/scheduledTest"); // <-- Import ScheduledTest model
const Classroom = require("../models/classroom");
const HodQuestion = require("../models/HodQuestion");
const ScheduledTestResult = require("../models/ScheduledTestResult");
// We no longer need the GoogleGenerativeAI library in this file
// because students will only get questions from the database.
const autoSubmitTest = async (req, res) => {
  try {
    const studentId = req.user._id; // It receives the current answers, session ID, scheduled test ID, and the reason
    const { answers, testSessionId, scheduledTestId, reason } = req.body;

    if (!answers || !testSessionId || !scheduledTestId || !reason) {
      return res
        .status(400)
        .json({ message: "Missing required data for auto-submission." });
    } // 1. Find the session to get the list of questions for grading

    const session = await TestSession.findById(testSessionId);
    if (!session || session.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "Invalid test session." });
    }
    const questionIds = session.questionIds; // 2. Grade the submitted answers against the HOD's question bank

    const correctAnswers = await HodQuestion.find({
      _id: { $in: questionIds },
    }).select("_id correctAnswer");
    let score = 0;
    const totalMarks = correctAnswers.length;
    const correctAnswerMap = new Map();
    correctAnswers.forEach((answer) => {
      correctAnswerMap.set(answer._id.toString(), answer.correctAnswer);
    });
    for (const questionId in answers) {
      if (correctAnswerMap.get(questionId) === answers[questionId]) {
        score++;
      }
    } // 3. Save the result to the ScheduledTestResult collection with the malpractice reason

    const newResult = new ScheduledTestResult({
      scheduledTestId,
      studentId,
      score,
      totalMarks,
      answers,
      malpracticeReason: reason, // <-- Store the reason
    });
    const savedResult = await newResult.save();

    res.status(201).json({
      message: "Test auto-submitted due to malpractice.",
      resultId: savedResult._id,
    });
  } catch (error) {
    console.error("Error during auto-submission:", error);
    res.status(500).json({ message: "Server error during auto-submission." });
  }
};
const startTest = async (req, res) => {
  const studentId = req.user._id; // Get student ID from the 'protect' middleware

  try {
    // --- This is the new, simplified logic ---
    // The student's experience is now fast, reliable, and always random.
    console.log(
      `Fetching random questions from the bank for student: ${studentId}`
    ); // 1. Define the categories and the number of questions we need from each.

    const categories = ["Quantitative", "Reasoning", "English", "Programming"];
    const questionsPerCategory = 10; // 2. Create a promise for each category to fetch random questions. // This is much more efficient than fetching all and slicing.

    const categoryPromises = categories.map((category) =>
      Question.aggregate([
        { $match: { section: category } }, // First, find all questions in the category
        { $sample: { size: questionsPerCategory } }, // Then, randomly sample the required number of them
      ])
    ); // 3. Run all these database queries in parallel for maximum speed.

    const results = await Promise.all(categoryPromises); // 4. Combine the results from all categories into one single array. // .flat() turns an array of arrays into a single array.

    const selectedQuestions = results.flat(); // 5. A crucial safety check: Do we have enough questions in the bank?

    if (selectedQuestions.length < 40) {
      return res.status(500).json({
        message:
          "Not enough questions in the bank to generate a full test. Please contact an administrator.",
      });
    } // 6. Get the IDs of the selected questions for the session record.

    const questionIds = selectedQuestions.map((q) => q._id); // 7. Create the unique "Exam Paper" (TestSession) for this student.

    const newSession = await TestSession.create({ studentId, questionIds });

    console.log(
      `Random questions served and session created for student: ${studentId}`
    ); // 8. Send the test (the full question objects and the session ID) to the student.

    return res.status(200).json({
      questions: selectedQuestions,
      testSessionId: newSession._id,
    });
  } catch (dbError) {
    console.error("Database error while starting test:", dbError);
    return res.status(500).json({
      message:
        "Failed to start test due to a database error. Please contact an administrator.",
    });
  }
};
// --- NEW: Function to start a specific, scheduled test ---
const startScheduledTest = async (req, res) => {
  try {
    const { scheduledTestId } = req.params;
    const studentId = req.user._id; // 1. Find the scheduled test "event ticket" (Unchanged)

    const scheduledTest = await ScheduledTest.findById(scheduledTestId);
    if (!scheduledTest) {
      return res.status(404).json({ message: "Scheduled test not found." });
    } // 2. Security checks (Unchanged and correct)

    const classroom = await Classroom.findOne({
      _id: scheduledTest.classroomId,
      students: studentId,
    });
    if (!classroom) {
      return res
        .status(403)
        .json({ message: "You are not authorized to start this test." });
    }
    const now = new Date();
    if (now < scheduledTest.startTime) {
      return res
        .status(403)
        .json({ message: "This test has not started yet." });
    }
    if (now > scheduledTest.endTime) {
      return res.status(403).json({ message: "This test has already ended." });
    } // 3. --- THE KEY UPGRADE: Get questions from the HOD's PRIVATE bank ---

    console.log(
      `Fetching questions from HOD's private bank for student: ${studentId}`
    );
    const categories = ["Quantitative", "Reasoning", "English", "Programming"];
    const categoryPromises = categories.map(
      (
        category // We now query the HodQuestion model
      ) =>
        HodQuestion.aggregate([
          // Crucial security check: only use questions from the HOD who scheduled the test
          { $match: { section: category, hodId: scheduledTest.hodId } },
          { $sample: { size: 10 } },
        ])
    );
    const results = await Promise.all(categoryPromises);
    const selectedQuestions = results.flat(); // 4. Update the safety check and error message

    if (selectedQuestions.length < 40) {
      return res.status(500).json({
        message:
          "The HOD has not added enough questions to their bank for this test.",
      });
    }

    const questionIds = selectedQuestions.map((q) => q._id);
    const newSession = await TestSession.create({ studentId, questionIds });

    return res.status(200).json({
      questions: selectedQuestions,
      testSessionId: newSession._id,
      endTime: scheduledTest.endTime,
    });
  } catch (error) {
    console.error("Error starting scheduled test:", error);
    res.status(500).json({ message: "Server error starting scheduled test." });
  }
};

module.exports = { startTest, startScheduledTest, autoSubmitTest };
