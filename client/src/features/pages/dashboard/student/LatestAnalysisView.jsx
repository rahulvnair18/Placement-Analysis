import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../../../context/AuthContext";
import AnalysisDashboard from "./AnalysisDashboard"; // We will re-use the component we already built

const LatestAnalysisView = () => {
  const { token } = useContext(AuthContext);

  const [latestResultDetails, setLatestResultDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestResultDetails = async () => {
      if (!token) {
        setIsLoading(false); // Stop loading if there's no token
        return;
      }
      setIsLoading(true);
      try {
        // 1. Fetch the history to find the latest test ID
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

          // 2. Fetch the full details for ONLY the latest test
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
      <div className="text-center text-gray-400 p-8">
        Loading your latest analysis...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  }

  // If there's a result, render the full analysis component for it.
  // If not, show a message.
  return (
    <div>
      {latestResultDetails ? (
        // --- THE CHANGE: We now render our new dashboard and pass the data to it ---
        <AnalysisDashboard resultData={latestResultDetails} />
      ) : (
        <div className="text-center text-gray-400 p-8">
          <h2 className="text-2xl font-bold">No Analysis Available</h2>
          <p className="mt-2">
            You must complete at least one test to view your performance
            analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default LatestAnalysisView;
