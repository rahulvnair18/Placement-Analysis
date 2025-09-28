import React from "react";
import { useParams, Link, useLocation } from "react-router-dom"; // 1. Import useLocation

const TestCompleted = () => {
  const { resultId } = useParams();
  const location = useLocation(); // 2. Get the location object

  // 3. Check the state passed from the previous page to see what kind of test it was.
  // We default to the mock test URL if the state is not available for any reason.
  const isScheduled = location.state?.isScheduled || false;
  const resultUrl = isScheduled
    ? `/scheduled-results/${resultId}` // URL for scheduled results
    : `/results/${resultId}`; // URL for mock results

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Content Card */}
      <div className="relative z-10 bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-10 max-w-lg w-full shadow-xl">
        <svg
          className="w-20 h-20 text-green-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
          Test Submitted Successfully!
        </h1>
        <p className="text-gray-300 mb-8">
          Your results have been calculated and saved. You can now view a
          detailed analysis of your performance.
        </p>

        {/* 4. Use the dynamic URL we created */}
        <Link
          to={resultUrl}
          className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/50 transform hover:scale-105"
        >
          View My Results & Analysis
        </Link>
      </div>
    </div>
  );
};

export default TestCompleted;
