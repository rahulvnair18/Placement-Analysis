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

  // Updated Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 flex justify-center items-center text-white text-xl font-semibold">
        Loading Test Analysis...
      </div>
    );
  }

  // Updated Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 flex justify-center items-center text-red-300 text-xl font-semibold">
        Error: {error}
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 flex justify-center items-center text-white text-xl font-semibold">
        No analysis data found for this test.
      </div>
    );
  }

  const {
    testTitle,
    topper,
    attemptedStudents,
    notAttemptedStudents,
    malpracticedStudents,
  } = analysisData;

  // Consistent card style
  const cardStyle =
    "bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl";

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <Link
            to="/hod-dashboard"
            className="bg-white/20 border border-white/30 px-5 py-2.5 rounded-lg text-white font-medium hover:bg-white/30 transition shadow-md"
          >
            ← Back to Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold drop-shadow-md">
              Performance Analysis
            </h1>
            <p className="text-white/80 text-lg mt-1">{testTitle}</p>
          </div>
        </header>

        {/* --- TOPPER CARD --- */}
        {topper && (
          <div className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-400 p-6 rounded-2xl mb-8 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-yellow-300">
              🏆 Test Topper
            </h2>
            <p className="text-4xl font-bold mt-2 drop-shadow-md">
              {topper.name}
            </p>
            <p className="text-2xl text-white/90 mt-1">
              Score: {topper.score} / {topper.totalMarks}
            </p>
          </div>
        )}
        {/* --- 2. NEW MALPRACTICE SECTION --- */}
        {malpracticedStudents && malpracticedStudents.length > 0 && (
          <div className="bg-red-900/40 backdrop-blur-lg border border-red-500/50 p-6 rounded-2xl shadow-xl mb-8">
            <h2 className="text-2xl font-bold mb-4 text-red-300">
              Malpractice Detected ({malpracticedStudents.length})
            </h2>
            <div className="overflow-y-auto max-h-96 pr-2">
              <table className="min-w-full text-left">
                <thead className="sticky top-0 bg-black/20 text-white/90">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-4 font-semibold">Score</th>
                    <th className="py-3 px-4 font-semibold">Reason</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {malpracticedStudents.map((student) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-white/10 transition-colors"
                    >
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">
                        {student.score} / {student.totalMarks}
                      </td>
                      <td className="py-3 px-4 font-medium text-red-300">
                        {student.reason}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/hod/student-analysis/${scheduledTestId}/${student.studentId}`}
                          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all shadow-md text-sm"
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
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- ATTEMPTED STUDENTS --- */}
          <div className={cardStyle}>
            <h2 className="text-2xl font-bold mb-4">
              Attempted ({attemptedStudents.length})
            </h2>
            <div className="overflow-y-auto max-h-96 pr-2">
              <table className="min-w-full text-left">
                <thead className="sticky top-0 bg-black/20 text-white/90">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-4 font-semibold">Score</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {attemptedStudents.map((student, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/10 transition-colors"
                    >
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">
                        {student.score} / {student.totalMarks}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/hod/student-analysis/${scheduledTestId}/${student.studentId}`}
                          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all shadow-md text-sm"
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
          <div className={cardStyle}>
            <h2 className="text-2xl font-bold mb-4">
              Did Not Attempt ({notAttemptedStudents.length})
            </h2>
            <div className="overflow-y-auto max-h-96 pr-2">
              <ul className="divide-y divide-white/10">
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
