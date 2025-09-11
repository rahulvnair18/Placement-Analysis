import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Instruction = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleStartTest = () => {
    if (agreed) {
      navigate("/test/engine");
    } else {
      // Replaced alert with a more modern approach, but keeping it simple for now.
      // In a real app, you might use a toast notification.
      alert("Please read and agree to the instructions to continue.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-3xl w-full shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Test Instructions
        </h1>

        {/* --- INSTRUCTIONS UPDATED --- */}
        <div className="space-y-4 text-gray-300 mb-6">
          <p>
            1. The test consists of{" "}
            <strong className="text-white">40 multiple-choice questions</strong>
            .
          </p>
          <p>
            2. The test is divided into two sections with a total duration of{" "}
            <strong className="text-white">20 minutes</strong>.
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li>
              <strong className="text-white">Section 1: Aptitude</strong> (15
              minutes) - This section contains 30 questions:
              <ul className="list-disc list-inside ml-6">
                <li>10 Quantitative questions</li>
                <li>10 Reasoning questions</li>
                <li>10 English questions</li>
              </ul>
            </li>
            <li>
              <strong className="text-white">
                Section 2: Programming & DSA
              </strong>{" "}
              (5 minutes) - This section contains 10 questions.
            </li>
          </ul>
          <p>
            3. The timer for each section is independent. After the timer for
            Section 1 expires, you will be automatically moved to Section 2.
          </p>
          <p>
            4. The test will be{" "}
            <strong className="text-red-400">auto-submitted</strong> after the
            total time of 20 minutes has elapsed.
          </p>
          <p>
            5. Any attempt at malpractice (e.g., leaving the browser window)
            will result in the test being{" "}
            <strong className="text-red-400">immediately auto-submitted</strong>
            .
          </p>
          <p>6. You cannot return to a previous section.</p>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="agreeCheckbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded"
          />
          <label htmlFor="agreeCheckbox" className="ml-2 text-gray-400">
            I have read and understood the instructions.
          </label>
        </div>
        <button
          onClick={handleStartTest}
          className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default Instruction;
