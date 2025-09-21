import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext"; // Adjust path if needed

const TestEngine = () => {
  // --- STATE AND CONSTANTS (Unchanged) ---
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const [testSessionId, setTestSessionId] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(15 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const SECTIONS = [
    {
      name: "Aptitude",
      types: ["Quantitative", "Reasoning", "English"],
      time: 15 * 60,
    },
    { name: "Programming & DSA", types: ["Programming"], time: 5 * 60 },
  ];

  // --- DATA FETCHING & TIMER (Unchanged) ---
  useEffect(() => {
    // This function decides whether to fetch questions or use the ones passed to it.
    const initializeTest = async () => {
      // Check if data was passed from the previous page (the scheduled test page)
      if (location.state?.testType === "scheduled") {
        console.log("Starting a scheduled test...");
        setAllQuestions(location.state.questions);
        setTestSessionId(location.state.testSessionId);
        setIsLoading(false);
      } else {
        // This is a regular mock test, so we fetch questions as normal.
        console.log("Starting a mock test...");
        try {
          const response = await fetch(
            "http://localhost:5000/api/tests/start-mock",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!response.ok) throw new Error("Failed to start mock test.");
          const data = await response.json();
          setAllQuestions(data.questions);
          setTestSessionId(data.testSessionId);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (token) {
      initializeTest();
    }
  }, [token, location.state]);

  useEffect(() => {
    if (isLoading || allQuestions.length === 0) return;

    let initialTime;
    // Check if this is a scheduled test with a fixed end time
    if (location.state?.endTime) {
      const endTime = new Date(location.state.endTime);
      const now = new Date();
      // Calculate the remaining seconds
      initialTime = Math.max(0, Math.floor((endTime - now) / 1000));
    } else {
      // It's a regular mock test, so use the standard section time
      initialTime = SECTIONS[currentSectionIndex].time;
    }

    setTimer(initialTime);

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          handleNextSection();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, currentSectionIndex, location.state]);

  const submitTest = async () => {
    if (isSubmitting) return; // Prevent multiple clicks
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/results/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers, testSessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit test.");
      }

      const resultData = await response.json();
      console.log("Test submitted successfully:", resultData);

      // On success, redirect to the "Test Completed" page with the new result ID
      navigate(`/test/completed/${resultData.resultId}`);
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false); // Stop loading on error
    }
  };
  // --- HELPER FUNCTIONS (Unchanged) ---
  const handleNextSection = () => {
    if (currentSectionIndex < SECTIONS.length - 1) {
      const nextSectionIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextSectionIndex);
      setCurrentQuestionIndex(0);
      setTimer(SECTIONS[nextSectionIndex].time);
    } else {
      // This is the final section, so we trigger the submission process
      submitTest();
    }
  };

  const handleSelectAnswer = (questionId, selectedOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSectionQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    if (index >= 0 && index < currentSectionQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // --- DERIVED STATE (Unchanged) ---
  const currentSectionQuestions = allQuestions.filter((q) =>
    SECTIONS[currentSectionIndex].types.includes(q.section)
  );
  const currentQuestion = currentSectionQuestions[currentQuestionIndex];

  // --- UI RENDER LOGIC (Unchanged) ---
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white text-2xl p-10">
        Submitting your test and calculating results...
      </div>
    );
  }
  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white text-2xl p-10">
        Loading Test...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-red-500 text-2xl p-10">
        Error: {error}
      </div>
    );
  if (!currentQuestion)
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white text-2xl p-10">
        Preparing test environment...
      </div>
    );

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col p-4 gap-4 font-sans">
      {/* HEADER (Unchanged) */}
      <header className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">{`Section ${
          currentSectionIndex + 1
        }: ${SECTIONS[currentSectionIndex].name}`}</h1>
        <div className="text-2xl font-mono bg-red-600 px-4 py-2 rounded-lg">
          {formatTime(timer)}
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* MAIN CONTENT (Unchanged) */}
        <main className="flex-1 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">{`Question ${
              currentQuestionIndex + 1
            } of ${currentSectionQuestions.length}`}</h2>
            <p className="text-gray-300 text-lg">
              {currentQuestion.questionText}
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(currentQuestion._id, option)}
                className={`w-full text-left p-3 rounded-lg border-2 border-gray-600 transition-colors 
                  ${
                    answers[currentQuestion._id] === option
                      ? "bg-blue-600 border-blue-500"
                      : "hover:bg-gray-700"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-4 flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              className="bg-gray-600 py-2 px-6 rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              className="bg-blue-600 py-2 px-6 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                currentQuestionIndex === currentSectionQuestions.length - 1
              }
            >
              Next
            </button>
          </div>
        </main>

        {/* --- SIDE PANEL (Question Palette) --- */}
        <aside className="w-64 bg-gray-800 p-4 rounded-lg shadow-md overflow-y-auto">
          <h3 className="font-bold mb-4 text-center">Question Palette</h3>
          <div className="grid grid-cols-5 gap-2">
            {currentSectionQuestions.map((q, index) => {
              // --- NEW: LOGIC FOR BUTTON COLOR ---
              const isAnswered = answers[q._id] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              let buttonClass =
                "h-10 w-10 flex items-center justify-center rounded";
              if (isCurrent) {
                buttonClass += " bg-blue-600 ring-2 ring-white";
              } else if (isAnswered) {
                buttonClass += " bg-green-600 hover:bg-green-500";
              } else {
                buttonClass += " bg-gray-600 hover:bg-gray-500";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleJumpToQuestion(index)}
                  className={buttonClass} // Use the dynamically generated class
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleNextSection}
              className="bg-green-600 w-full py-2 rounded-lg hover:bg-green-500"
            >
              {currentSectionIndex < SECTIONS.length - 1
                ? "Submit Section"
                : "Submit Test"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TestEngine;
