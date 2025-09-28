import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../../../context/AuthContext";
import AnalysisDashboard from "./AnalysisDashboard";

const LatestAnalysisView = () => {
  const { token } = useContext(AuthContext);

  const [latestResultDetails, setLatestResultDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestResultDetails = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const historyResponse = await fetch(
          "http://localhost:5000/api/results/my-history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!historyResponse.ok)
          throw new Error("Failed to fetch test history.");
        const historyData = await historyResponse.json();

        if (historyData.length > 0) {
          const latestResultId = historyData[0]._id;

          const detailsResponse = await fetch(
            `http://localhost:5000/api/results/${latestResultId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!detailsResponse.ok)
            throw new Error("Failed to fetch the latest result details.");
          const detailsData = await detailsResponse.json();
          setLatestResultDetails(detailsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestResultDetails();
  }, [token]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        <p className="relative z-10 text-white text-xl">
          Loading your latest analysis...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        <p className="relative z-10 text-red-400 text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto p-8">
        {latestResultDetails ? (
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
              Your Latest Analysis
            </h1>
            <AnalysisDashboard resultData={latestResultDetails} />
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-white/20 text-center">
            <h2 className="text-3xl font-bold text-orange-300 mb-4">
              No Analysis Available
            </h2>
            <p className="text-white/90 text-lg mb-6">
              🚀 Take your first test to unlock performance insights and track
              your progress here.
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-blue-500 px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition">
              Start a Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestAnalysisView;
