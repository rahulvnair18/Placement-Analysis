// --- THE FIX: We need to import the AI library and create the genAI instance here ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We still need our database models to fetch data.
const User = require("../models/user");
const Classroom = require("../models/classroom");
const Question = require("../models/question");

// --- Functions to get data (unchanged) ---
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "Student" }).select("-password");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching students." });
  }
};

const getAllHods = async (req, res) => {
  try {
    const hods = await User.find({ role: "HOD" }).select("-password");
    res.status(200).json(hods);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching HODs." });
  }
};

const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({}).populate("hodId", "fullName");
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching classrooms." });
  }
};

// --- The upgraded question generation logic (now it can find genAI) ---
const addQuestionsToBank = async (req, res) => {
  const { category, count } = req.body;
  if (!category || !count || count <= 0) {
    return res.status(400).json({
      message:
        "Please provide a valid category and a positive number of questions.",
    });
  }
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const prompt = `
      Generate exactly ${count} high-quality, multiple-choice questions for a competitive placement test, formatted as a valid JSON array.
      CRITICAL RULE: All questions in this batch MUST belong to the following section: "${category}".
      Each question object must contain: "section", "questionText", "options" (array of 4), "correctAnswer", and "explanation".
      Ensure all quotation marks within string values are properly escaped (e.g., \\").
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const startIndex = text.indexOf("[");
    const endIndex = text.lastIndexOf("]");
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Valid JSON array not found in AI response.");
    }
    const jsonString = text.substring(startIndex, endIndex + 1);
    const questionsFromAI = JSON.parse(jsonString);

    const savedQuestions = await Question.insertMany(questionsFromAI);

    res.status(201).json({
      message: `Successfully added ${savedQuestions.length} new ${category} questions to the bank.`,
    });
  } catch (error) {
    console.error("Failed to add questions to bank:", error);
    res
      .status(500)
      .json({ message: `Error adding questions: ${error.message}` });
  }
};

module.exports = {
  getAllStudents,
  getAllHods,
  getAllClassrooms,
  addQuestionsToBank,
};
