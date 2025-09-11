import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Instruction from "../Test/instruction";
const FullTestPractice = () => {
  // 🆕 State to track if the user has attempted a test
  const [hasAttemptedTest, setHasAttemptedTest] = useState(false);
  const navigate = useNavigate();
  // 🆕 Function to handle the start test button click
  const handleStartTest = () => {
    navigate("/test/instruction");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      {!hasAttemptedTest ? (
        // 🆕 UI for a user who has not attempted a test
        <div className="flex flex-col items-center">
          <p className="text-xl text-gray-400 mb-6">
            You haven't attempted a full test yet.
          </p>
          <button
            onClick={handleStartTest}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Start Test
          </button>
        </div>
      ) : (
        // 🆕 UI for a user who has attempted a test
        <div className="w-full max-w-2xl space-y-6">
          <div className="bg-gray-700 rounded-lg p-6 flex flex-col items-center shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Start New Test</h3>
            <p className="text-gray-400 mb-6">
              You can always take another full test to improve your score.
            </p>
            <button
              onClick={handleStartTest}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition"
            >
              Start Test
            </button>
          </div>

          <div className="bg-gray-700 rounded-lg p-6 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Past Test Results</h3>
            {/* You would map over an array of past results here */}
            <div className="text-gray-400">No past results found.</div>
            {/* For example:
            {pastResults.map((result, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-md mb-2">
                Test Date: {result.date} - Score: {result.score}
              </div>
            ))}
            */}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullTestPractice;
