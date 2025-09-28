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

const AnalysisDashboard = ({ resultData }) => {
  if (!resultData) return null;

  const overallPieData = [
    { name: "Correct", value: resultData.score },
    { name: "Incorrect", value: resultData.totalMarks - resultData.score },
  ];
  const OVERALL_COLORS = ["#10B981", "#EF4444"]; // Green for correct, Red for incorrect

  const sectionBarData = Object.keys(resultData.sectionScores).map(
    (section) => ({
      name: section,
      score: resultData.sectionScores[section],
      total: resultData.sectionTotals[section],
    })
  );

  const aptitudeSections = ["Quantitative", "Reasoning", "English"];
  let aptitudeScore = 0;
  let aptitudeTotal = 0;
  aptitudeSections.forEach((section) => {
    aptitudeScore += resultData.sectionScores[section] || 0;
    aptitudeTotal += resultData.sectionTotals[section] || 0;
  });

  const programmingScore = resultData.sectionScores["Programming"] || 0;
  const programmingTotal = resultData.sectionTotals["Programming"] || 0;

  // Consistent card style from the rest of the application
  const cardStyle =
    "bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl";

  return (
    <div className="space-y-8">
      {/* Main Score */}
      <div className={`${cardStyle} text-center`}>
        <p className="text-gray-300 text-lg">
          Your Overall Score on the Last Test
        </p>
        <p className="text-7xl font-bold my-2 text-white drop-shadow-lg">
          {((resultData.score / resultData.totalMarks) * 100).toFixed(1)}%
        </p>
        <p className="text-xl text-gray-300">
          ({resultData.score} / {resultData.totalMarks} Correct)
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cardStyle}>
          <h3 className="text-2xl font-bold mb-4 text-center text-white">
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
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 20, 0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  borderRadius: "0.75rem",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={cardStyle}>
          <h3 className="text-2xl font-bold mb-4 text-center text-white">
            Individual Section Scores
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={sectionBarData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="name" stroke="#A0AEC0" />
              <YAxis domain={[0, 10]} stroke="#A0AEC0" />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 20, 0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  borderRadius: "0.75rem",
                }}
              />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aggregated Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`${cardStyle} text-center`}>
          <p className="text-gray-300 text-lg">Aptitude Score</p>
          <p className="text-6xl font-bold my-2 text-white">
            {aptitudeScore} / {aptitudeTotal}
          </p>
          <p className="text-blue-300 text-2xl">
            {aptitudeTotal > 0
              ? ((aptitudeScore / aptitudeTotal) * 100).toFixed(1) + "%"
              : "N/A"}
          </p>
        </div>
        <div className={`${cardStyle} text-center`}>
          <p className="text-gray-300 text-lg">Programming Score</p>
          <p className="text-6xl font-bold my-2 text-white">
            {programmingScore} / {programmingTotal}
          </p>
          <p className="text-orange-300 text-2xl">
            {programmingTotal > 0
              ? ((programmingScore / programmingTotal) * 100).toFixed(1) + "%"
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
