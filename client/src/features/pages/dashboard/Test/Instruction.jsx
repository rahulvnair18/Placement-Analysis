import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Instruction = () => {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStartTest = () => {
    if (agreed) {
      navigate("/test/engine");
    } else {
      setError("Please read and agree to the instructions to continue.");
    }
  };

  const handleCheckboxChange = (e) => {
    setAgreed(e.target.checked);
    if (e.target.checked) {
      setError(""); // Clear error when checkbox is checked
    }
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Content Card */}
      <div className="relative z-10 bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-3xl w-full shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
          Test Instructions
        </h1>

        <div className="space-y-4 text-gray-300 mb-6 max-h-[50vh] overflow-y-auto pr-4">
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
            <strong className="text-orange-400">auto-submitted</strong> after
            the total time of 20 minutes has elapsed.
          </p>
          <p>
            5. Any attempt at malpractice (e.g., leaving the browser window)
            will result in the test being{" "}
            <strong className="text-orange-400">
              immediately auto-submitted
            </strong>
            .
          </p>
          <p>6. You cannot return to a previous section.</p>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="agreeCheckbox"
            checked={agreed}
            onChange={handleCheckboxChange}
            className="form-checkbox h-5 w-5 text-orange-500 bg-black/20 border-white/30 rounded focus:ring-orange-500"
          />
          <label htmlFor="agreeCheckbox" className="ml-3 text-gray-300">
            I have read and understood the instructions.
          </label>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleStartTest}
          className="w-full bg-orange-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/50 disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={!agreed}
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default Instruction;
