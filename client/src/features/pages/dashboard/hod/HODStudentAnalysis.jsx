import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HODStudentAnalysis = () => {
  const { scheduledTestId, studentId } = useParams();
  const { token } = useContext(AuthContext);

  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Data fetching logic is correct and remains unchanged
    const fetchResultDetails = async () => {
      if (!token || !scheduledTestId || !studentId) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/hod/student-result/${scheduledTestId}/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch result details."
          );
        }
        const data = await response.json();
        setResultData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResultDetails();
  }, [scheduledTestId, studentId, token]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-red-500">
        Error: {error}
      </div>
    );
  if (!resultData)
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        No data.
      </div>
    );

  // --- THIS IS THE MISSING UI CODE ---
  const barChartData = Object.keys(resultData.sectionScores).map((section) => ({
    name: section,
    score: resultData.sectionScores[section],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Student Result Analysis</h1>
          <div>
            <Link
              to={`/hod/test-analysis/${scheduledTestId}`}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Test Summary
            </Link>
          </div>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-700 p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">Performance Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-5xl font-bold text-green-400">
                    {resultData.score}
                  </p>
                  <p className="text-gray-400">Correct</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-5xl font-bold text-red-400">
                    {resultData.totalMarks - resultData.score}
                  </p>
                  <p className="text-gray-400">Incorrect</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center col-span-2">
                  <p className="text-5xl font-bold">
                    {((resultData.score / resultData.totalMarks) * 100).toFixed(
                      1
                    )}
                    %
                  </p>
                  <p className="text-gray-400">Overall Score</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Section-wise Score
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    stroke="#A0AEC0"
                  />
                  <Tooltip
                    cursor={{ fill: "#2D3748" }}
                    contentStyle={{ backgroundColor: "#1A202C" }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#3B82F6"
                    background={{ fill: "#4A5568" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Detailed Question Review
            </h2>
            <div className="space-y-4">
              {resultData.analysis.map((item, index) => (
                <div key={item._id} className="bg-gray-700 p-6 rounded-lg">
                  <p className="font-semibold text-lg mb-3">
                    <span className="bg-blue-600 text-white rounded-full px-3 py-1 mr-3">
                      {index + 1}
                    </span>
                    {item.questionText}
                  </p>
                  <div className="space-y-2 mb-4 pl-12">
                    {item.options.map((option) => {
                      const isCorrect = option === item.correctAnswer;
                      const isStudentAnswer = option === item.studentAnswer;
                      let optionClass = "border-gray-600";
                      if (isCorrect)
                        optionClass =
                          "border-green-500 bg-green-900/50 text-green-300";
                      if (isStudentAnswer && !item.isCorrect)
                        optionClass =
                          "border-red-500 bg-red-900/50 text-red-300 line-through";
                      return (
                        <div
                          key={option}
                          className={`p-3 border-2 rounded-lg ${optionClass}`}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>
                  {item.studentAnswer !== "Not Attempted" &&
                    !item.isCorrect && (
                      <p className="pl-12 mb-4 text-green-400 font-semibold">
                        Correct Answer: {item.correctAnswer}
                      </p>
                    )}
                  <div className="bg-gray-900/50 p-4 rounded-lg pl-12">
                    <p className="font-bold text-blue-300">Explanation:</p>
                    <p className="text-gray-300">{item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODStudentAnalysis;
