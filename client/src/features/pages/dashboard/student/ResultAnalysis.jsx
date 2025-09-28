import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const ResultAnalysis = ({ resultId: propResultId }) => {
  const { resultId: paramResultId } = useParams();
  const resultId = propResultId || paramResultId;
  const { token } = useContext(AuthContext);

  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResultDetails = async () => {
      if (!token || !resultId) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/results/${resultId}`,
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
  }, [resultId, token]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 flex justify-center items-center text-white text-xl font-semibold">
        Loading Your Analysis...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 flex justify-center items-center text-red-300 text-xl font-semibold">
        Error: {error}
      </div>
    );
  if (!resultData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 flex justify-center items-center text-white text-xl font-semibold">
        No result data found.
      </div>
    );

  const barChartData = Object.keys(resultData.sectionScores).map((section) => ({
    name: section,
    score: resultData.sectionScores[section],
    total: resultData.sectionTotals[section],
  }));

  const cardStyle =
    "bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl";
  const mainContainerStyle =
    "bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl space-y-8";

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold drop-shadow-lg text-center sm:text-left">
            Test Result & Analysis
          </h1>
          <Link
            to="/student-dashboard" // Corrected path assuming it's for students
            className="bg-white/10 border border-white/20 px-5 py-2.5 rounded-lg font-medium hover:bg-white/20 transition shadow-md"
          >
            Back to Dashboard
          </Link>
        </header>

        <div className={mainContainerStyle}>
          {/* Scorecard & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Summary */}
            <div className={cardStyle}>
              <h2 className="text-2xl font-bold mb-4">Performance Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-lg text-center">
                  <p className="text-5xl font-bold text-green-400">
                    {resultData.score}
                  </p>
                  <p className="text-gray-300">Correct</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg text-center">
                  <p className="text-5xl font-bold text-red-400">
                    {resultData.totalMarks - resultData.score}
                  </p>
                  <p className="text-gray-300">Incorrect</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg text-center col-span-2">
                  <p className="text-5xl font-bold">
                    {((resultData.score / resultData.totalMarks) * 100).toFixed(
                      1
                    )}
                    %
                  </p>
                  <p className="text-gray-300">Overall Score</p>
                </div>
              </div>
            </div>

            {/* Section-wise Chart */}
            <div className={cardStyle}>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Section-wise Score
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.1)"
                  />
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    stroke="#A0AEC0"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 20, 0.8)",
                      borderColor: "rgba(255,255,255,0.2)",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#3B82F6"
                    background={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Detailed Question Review
            </h2>
            <div className="space-y-4">
              {resultData.analysis.map((item, index) => (
                <div key={item._id} className={cardStyle}>
                  <p className="font-semibold text-lg mb-3 flex items-start">
                    <span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                      {index + 1}
                    </span>
                    {item.questionText}
                  </p>
                  <div className="space-y-2 mb-4 pl-12">
                    {item.options.map((option) => {
                      const isCorrect = option === item.correctAnswer;
                      const isStudentAnswer = option === item.studentAnswer;
                      let optionClass = "border-white/20";
                      if (isCorrect)
                        optionClass =
                          "border-green-400 bg-green-500/20 text-green-300";
                      if (isStudentAnswer && !item.isCorrect)
                        optionClass =
                          "border-red-400 bg-red-500/20 text-red-300 line-through";

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
                  <div className="bg-black/20 p-4 rounded-lg pl-12">
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

export default ResultAnalysis;
