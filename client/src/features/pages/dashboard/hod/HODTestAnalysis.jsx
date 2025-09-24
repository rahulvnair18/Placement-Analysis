import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";

const HODTestAnalysis = () => {
  const { scheduledTestId } = useParams();
  const { token } = useContext(AuthContext);

  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/hod/test-analysis/${scheduledTestId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch analysis data.");
        }
        setAnalysisData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [token, scheduledTestId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        Loading Test Analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        No analysis data found for this test.
      </div>
    );
  }

  const { testTitle, topper, attemptedStudents, notAttemptedStudents } =
    analysisData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Link
            to="/hod-dashboard"
            className="text-blue-400 hover:underline mb-4 block"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">Performance Analysis</h1>
          <p className="text-gray-400 text-xl">{testTitle}</p>
        </header>

        {/* --- TOPPER CARD --- */}
        {topper && (
          <div className="bg-yellow-800/50 border border-yellow-500 p-6 rounded-2xl mb-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-400">🏆 Topper</h2>
            <p className="text-4xl font-bold mt-2">{topper.name}</p>
            <p className="text-2xl text-gray-300 mt-1">
              Score: {topper.score} / {topper.totalMarks}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- ATTEMPTED STUDENTS --- */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              Attempted Students ({attemptedStudents.length})
            </h2>
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Score</th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {attemptedStudents.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-700/50">
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">
                        {student.score} / {student.totalMarks}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/hod/student-analysis/${scheduledTestId}/${student.studentId}`}
                          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- NOT ATTEMPTED STUDENTS --- */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              Did Not Attempt ({notAttemptedStudents.length})
            </h2>
            <div className="overflow-y-auto max-h-96">
              <ul className="divide-y divide-gray-700">
                {notAttemptedStudents.map((student) => (
                  <li key={student._id} className="py-3 px-4">
                    {student.fullName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODTestAnalysis;
