const Question = require("../models/question");
const TestSession = require("../models/testSession");

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

module.exports = { startTest };
