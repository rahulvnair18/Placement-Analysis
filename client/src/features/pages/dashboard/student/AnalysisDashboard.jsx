import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// This is a "presentational" component. It just receives data and displays it.
const AnalysisDashboard = ({ resultData }) => {
  if (!resultData) return null; // Don't render if there's no data

  // --- 1. Prepare data for the Overall Pie Chart ---
  const overallPieData = [
    { name: "Correct", value: resultData.score },
    { name: "Incorrect", value: resultData.totalMarks - resultData.score },
  ];
  const OVERALL_COLORS = ["#10B981", "#EF4444"]; // Green & Red

  // --- 2. Prepare data for the Section Bar Chart ---
  const sectionBarData = Object.keys(resultData.sectionScores).map(
    (section) => ({
      name: section,
      score: resultData.sectionScores[section],
    })
  );

  // --- 3. Calculate Aggregated Section Scores (Aptitude vs Programming) ---
  const aptitudeSections = ["Quantitative", "Reasoning", "English"];
  let aptitudeScore = 0;
  let aptitudeTotal = 0;

  aptitudeSections.forEach((section) => {
    aptitudeScore += resultData.sectionScores[section] || 0;
    aptitudeTotal += resultData.sectionTotals[section] || 0;
  });

  const programmingScore = resultData.sectionScores["Programming"] || 0;
  const programmingTotal = resultData.sectionTotals["Programming"] || 0;

  return (
    <div className="space-y-8">
      {/* --- Main Score and Percentage --- */}
      <div className="text-center bg-gray-800 p-6 rounded-xl shadow-lg">
        <p className="text-gray-400 text-lg">
          Your Overall Score on the Last Test
        </p>
        <p className="text-7xl font-bold my-2">
          {((resultData.score / resultData.totalMarks) * 100).toFixed(1)}%
        </p>
        <p className="text-2xl text-gray-300">
          ({resultData.score} / {resultData.totalMarks} Correct)
        </p>
      </div>

      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-2xl font-bold mb-4 text-center">
            Overall Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={overallPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {overallPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={OVERALL_COLORS[index % OVERALL_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1A202C" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-2xl font-bold mb-4 text-center">
            Individual Section Scores
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={sectionBarData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="name" stroke="#A0AEC0" />
              <YAxis domain={[0, 10]} stroke="#A0AEC0" />
              <Tooltip
                cursor={{ fill: "#2D3748" }}
                contentStyle={{ backgroundColor: "#1A202C" }}
              />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Aggregated Section Scores --- */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-center">
          Aggregated Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-gray-400 text-lg">Aptitude Score</p>
            <p className="text-6xl font-bold my-2">
              {aptitudeScore} / {aptitudeTotal}
            </p>
            <p className="text-2xl text-blue-400">
              {((aptitudeScore / aptitudeTotal) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-gray-400 text-lg">Programming Score</p>
            <p className="text-6xl font-bold my-2">
              {programmingScore} / {programmingTotal}
            </p>
            <p className="text-2xl text-purple-400">
              {((programmingScore / programmingTotal) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
