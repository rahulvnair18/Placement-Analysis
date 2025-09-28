import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";

const FullTestPractice = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [testHistory, setTestHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [token]);

  const handleStartTest = () => {
    navigate("/test/instruction");
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-300 p-10 animate-pulse">
        Loading your test history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 bg-red-900/30 p-6 rounded-xl mt-8">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 animate-gradient-x"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto p-8">
        {testHistory.length === 0 ? (
          // --- View #1: No test attempts ---
          <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/20 mt-20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Practicing
            </h2>
            <p className="text-lg text-gray-200 mb-8">
              You haven’t attempted a full test yet. Begin now to track your
              progress.
            </p>
            <button
              onClick={handleStartTest}
              className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl text-lg 
                         hover:bg-orange-600 hover:scale-105 transition-all shadow-lg"
            >
              Start Your First Test
            </button>
          </div>
        ) : (
          // --- View #2: With test history ---
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                Your Past Attempts
              </h2>
              <button
                onClick={handleStartTest}
                className="bg-orange-500 text-white font-bold py-2 px-6 rounded-xl 
                           hover:bg-orange-600 hover:scale-105 transition-all shadow-lg"
              >
                Start New Test
              </button>
            </div>

            {/* History table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-white/20 rounded-xl overflow-hidden">
                <thead className="bg-white/20 text-white text-lg">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">
                      Date Attempted
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Score</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {testHistory.map((result, idx) => (
                    <tr
                      key={result._id}
                      className={`hover:bg-white/10 transition ${
                        idx % 2 === 0 ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-gray-200">
                        {new Date(result.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-lg font-bold text-blue-300">
                        {result.score} / {result.totalMarks}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/results/${result._id}`}
                          className="bg-blue-600 text-white font-semibold py-2 px-4 
                                     rounded-lg hover:bg-blue-700 hover:scale-105 
                                     transition-all shadow-md"
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
    </div>
  );
};

export default FullTestPractice;
