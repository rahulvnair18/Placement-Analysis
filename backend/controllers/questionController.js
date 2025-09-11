const Question = require("../models/question");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getQuestions = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            section: { type: "STRING" },
            questionText: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            correctAnswer: { type: "STRING" },
            explanation: { type: "STRING" },
          },
          required: [
            "section",
            "questionText",
            "options",
            "correctAnswer",
            "explanation",
          ],
        },
      },
    };

    const prompt = `
      Generate exactly 40 multiple-choice questions for a competitive placement test.
      The distribution MUST be as follows:
      - 10 questions with the section "Quantitative".
      - 10 questions with the section "Reasoning".
      - 10 questions with the section "English".
      - 10 questions with the section "Programming" (covering a mix of programming concepts and DSA).
      Respond ONLY with a pure JSON array (no explanations, no markdown).
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    let text = await result.response.text();

    // Clean markdown code fences if present
    text = text.replace(/```json|```/g, "").trim();

    // Extract JSON array
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("AI did not return valid JSON. Raw response:", text);
      throw new Error("Valid JSON array not found in AI response.");
    }

    const questionsFromAI = JSON.parse(match[0]);

    await Question.deleteMany({});
    const savedQuestions = await Question.insertMany(questionsFromAI);

    return res.status(200).json(savedQuestions);
  } catch (error) {
    console.error("Gemini API call failed, falling back to database:", error);

    const cachedQuestions = await Question.find({});
    if (cachedQuestions && cachedQuestions.length > 0) {
      return res.status(200).json(cachedQuestions);
    } else {
      return res.status(500).json({
        message: "Failed to fetch questions. No cached data available.",
      });
    }
  }
};
module.exports = {
  getQuestions,
};
