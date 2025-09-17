import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";

import Instruction from "../Test/instruction";
const FullTestPractice = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  // --- STEP 1: Replace "Dummy" State with Real State ---
  // We now store the list of past tests, plus loading and error states.
  const [testHistory, setTestHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- STEP 2: Fetch Real Data When the Page Loads ---
  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://localhost:5000/api/results/my-history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch your test history.");
        }
        const data = await response.json();
        setTestHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [token]); // The empty dependency array means this runs once on load.
  const handleStartTest = () => {
    navigate("/test/instruction");
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 p-8">
        Loading your test history...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  }
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* --- STEP 3: Make the UI "Smart" --- */}
      {/* This logic now checks if the real testHistory array is empty. */}
      {testHistory.length === 0 ? (
        // --- VIEW #1: For users who have NOT taken a test ---
        <div className="flex flex-col items-center text-center p-8">
          <p className="text-xl text-gray-400 mb-6">
            You haven't attempted a full test yet.
          </p>
          <button
            onClick={handleStartTest}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Start Your First Test
          </button>
        </div>
      ) : (
        // --- VIEW #2: For users WITH a test history ---
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Your Past Attempts</h2>
            <button
              onClick={handleStartTest}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              Start New Test
            </button>
          </div>

          {/* --- STEP 4: Build the Dynamic History Table --- */}
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">
                    Date Attempted
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Score</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {testHistory.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      {/* Format the date to be more readable */}
                      {new Date(result.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-lg">{result.score}</span>{" "}
                      / {result.totalMarks}
                    </td>
                    <td className="py-3 px-4">
                      {/* This link takes the user to the analysis page for THIS specific result */}
                      <Link
                        to={`/results/${result._id}`}
                        className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition text-sm"
                      >
                        View Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullTestPractice;
