const Question = require("../models/question");
const TestSession = require("../models/testSession");
const ScheduledTest = require("../models/scheduledTest"); // <-- Import ScheduledTest model
const Classroom = require("../models/classroom");
// We no longer need the GoogleGenerativeAI library in this file
// because students will only get questions from the database.

const startTest = async (req, res) => {
  const studentId = req.user._id; // Get student ID from the 'protect' middleware

  try {
    // --- This is the new, simplified logic ---
    // The student's experience is now fast, reliable, and always random.
    console.log(
      `Fetching random questions from the bank for student: ${studentId}`
    );

    // 1. Define the categories and the number of questions we need from each.
    const categories = ["Quantitative", "Reasoning", "English", "Programming"];
    const questionsPerCategory = 10;

    // 2. Create a promise for each category to fetch random questions.
    // This is much more efficient than fetching all and slicing.
    const categoryPromises = categories.map((category) =>
      Question.aggregate([
        { $match: { section: category } }, // First, find all questions in the category
        { $sample: { size: questionsPerCategory } }, // Then, randomly sample the required number of them
      ])
    );

    // 3. Run all these database queries in parallel for maximum speed.
    const results = await Promise.all(categoryPromises);

    // 4. Combine the results from all categories into one single array.
    // .flat() turns an array of arrays into a single array.
    const selectedQuestions = results.flat();

    // 5. A crucial safety check: Do we have enough questions in the bank?
    if (selectedQuestions.length < 40) {
      return res.status(500).json({
        message:
          "Not enough questions in the bank to generate a full test. Please contact an administrator.",
      });
    }

    // 6. Get the IDs of the selected questions for the session record.
    const questionIds = selectedQuestions.map((q) => q._id);

    // 7. Create the unique "Exam Paper" (TestSession) for this student.
    const newSession = await TestSession.create({ studentId, questionIds });

    console.log(
      `Random questions served and session created for student: ${studentId}`
    );

    // 8. Send the test (the full question objects and the session ID) to the student.
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
    const studentId = req.user._id;

    // 1. Find the scheduled test "event ticket".
    const scheduledTest = await ScheduledTest.findById(scheduledTestId);
    if (!scheduledTest) {
      return res.status(404).json({ message: "Scheduled test not found." });
    }

    // 2. Security Check: Is the student a member of the classroom this test is for?
    const classroom = await Classroom.findOne({
      _id: scheduledTest.classroomId,
      students: studentId,
    });
    if (!classroom) {
      return res
        .status(403)
        .json({ message: "You are not authorized to start this test." });
    }

    // 3. --- The Crucial Time Check ---
    const now = new Date();
    if (now < scheduledTest.startTime) {
      return res
        .status(403)
        .json({ message: "This test has not started yet." });
    }
    if (now > scheduledTest.endTime) {
      return res.status(403).json({ message: "This test has already ended." });
    }

    // 4. If all checks pass, get the questions for the test.
    // For now, we'll get random questions. Later, you could link specific questions to a scheduled test.
    const categories = ["Quantitative", "Reasoning", "English", "Programming"];
    const categoryPromises = categories.map((category) =>
      Question.aggregate([
        { $match: { section: category } },
        { $sample: { size: 10 } },
      ])
    );
    const results = await Promise.all(categoryPromises);
    const selectedQuestions = results.flat();

    if (selectedQuestions.length < 40) {
      return res
        .status(500)
        .json({ message: "Not enough questions in the bank for this test." });
    }

    const questionIds = selectedQuestions.map((q) => q._id);

    // 5. Create the unique "Exam Paper" for this student for this attempt.
    const newSession = await TestSession.create({ studentId, questionIds });

    console.log(`Scheduled test started for student: ${studentId}`);

    // 6. Send the test to the student, including the crucial FIXED end time.
    return res.status(200).json({
      questions: selectedQuestions,
      testSessionId: newSession._id,
      endTime: scheduledTest.endTime, // <-- This is the key for the dynamic timer
    });
  } catch (error) {
    console.error("Error starting scheduled test:", error);
    res.status(500).json({ message: "Server error starting scheduled test." });
  }
};

module.exports = { startTest, startScheduledTest };
