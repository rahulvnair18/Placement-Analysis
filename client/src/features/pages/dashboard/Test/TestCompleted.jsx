import React from "react";
import { useParams, Link } from "react-router-dom";

const TestCompleted = () => {
  // The useParams hook allows us to get the dynamic part of the URL.
  // In our route, we will define it as '/test/completed/:resultId',
  // so this hook will give us access to the 'resultId'.
  const { resultId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-gray-800 rounded-2xl p-10 max-w-lg w-full shadow-lg">
        <svg
          className="w-20 h-20 text-green-500 mx-auto mb-4"
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
        <h1 className="text-3xl font-bold mb-4">
          Test Submitted Successfully!
        </h1>
        <p className="text-gray-400 mb-8">
          Your results have been calculated and saved. You can now view a
          detailed analysis of your performance.
        </p>

        {/* This Link component creates a button that navigates the user to their unique results page. */}
        <Link
          to={`/results/${resultId}`}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          View My Results & Analysis
        </Link>
      </div>
    </div>
  );
};

export default TestCompleted;
