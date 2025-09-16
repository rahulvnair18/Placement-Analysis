const Question = require("../models/question");
const TestSession = require("../models/testSession");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const startTest = async (req, res) => {
  const studentId = req.user._id; // Get student ID from the 'protect' middleware

  try {
    // --- ATTEMPT 1: GET LIVE AI QUESTIONS (The "Daily Special") ---
    console.log(
      `Attempting to generate live questions for student: ${studentId}`
    );
    const model = genAI.getGenerativeModel({
      // Using a stable model
      model: "models/gemini-2.5-flash",
    });
    const prompt = `
      Generate 40 unique multiple-choice questions for a placement test, formatted as a valid JSON array.
      Distribution: 10 Quantitative, 10 Reasoning, 10 English, 10 Programming/DSA.
      
      Each object needs the following keys: section, questionText, options, correctAnswer, explanation.

      CRITICAL RULE #1: The value for the "section" key MUST be one of these exact four strings: "Quantitative", "Reasoning", "English", "Programming". Do NOT add extra words like "Aptitude".

      CRITICAL RULE #2: Ensure the entire output is a single, valid JSON array with no unescaped quotes or extra text.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const startIndex = text.indexOf("[");
    const endIndex = text.lastIndexOf("]");
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("AI response was not valid JSON.");
    }
    const jsonString = text.substring(startIndex, endIndex + 1);
    // --- THE DEFINITIVE FIX ---
    // This sanitizer is our final safety net. It removes invisible control characters
    // (like newlines/tabs inside strings) that the AI sometimes adds by mistake.
    // This prevents the "Bad control character" error for good.
    jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    const questionsFromAI = JSON.parse(jsonString);

    const savedQuestions = await Question.insertMany(questionsFromAI);
    const questionIds = savedQuestions.map((q) => q._id);

    // --- UPDATED LOGIC ---
    // 1. Capture the newly created session to get its ID.
    const newSession = await TestSession.create({ studentId, questionIds });

    console.log(
      `Live questions generated and session created for student: ${studentId}`
    );
    // 2. Send back BOTH the questions and the new session's ID.
    return res.status(200).json({
      questions: savedQuestions,
      testSessionId: newSession._id,
    });
  } catch (error) {
    // --- ATTEMPT 2: FALLBACK TO DATABASE (The "Backup Buffet") ---
    console.warn(
      `AI generation failed for student ${studentId}. Falling back to database. Reason:`,
      error.message
    );
    try {
      const randomQuestions = await Question.aggregate([
        // This query finds 10 random questions from each of the 4 main sections
        {
          $match: {
            section: {
              $in: ["Quantitative", "Reasoning", "English", "Programming"],
            },
          },
        },
        { $group: { _id: "$section", questions: { $push: "$_id" } } },
        {
          $project: {
            _id: 0,
            section: "$_id",
            questions: { $slice: ["$questions", 10] },
          },
        },
      ]);

      let questionIds = [];
      randomQuestions.forEach((group) => {
        questionIds = questionIds.concat(group.questions);
      });

      if (questionIds.length < 40) {
        return res.status(500).json({
          message: "Not enough questions in the bank to start a test.",
        });
      }

      const selectedQuestions = await Question.find({
        _id: { $in: questionIds },
      });

      // --- UPDATED LOGIC ---
      // 1. Capture the newly created session to get its ID.
      const newSession = await TestSession.create({ studentId, questionIds });

      console.log(
        `Backup questions served and session created for student: ${studentId}`
      );
      // 2. Send back BOTH the questions and the new session's ID.
      return res.status(200).json({
        questions: selectedQuestions,
        testSessionId: newSession._id,
      });
    } catch (dbError) {
      console.error("Database fallback also failed:", dbError);
      return res.status(500).json({
        message: "Failed to start test. Please contact an administrator.",
      });
    }
  }
};

module.exports = { startTest };
