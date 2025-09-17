import React, { useState, useContext } from "react";
import FullTestPractice from "./FullTestPractice";
import ResultAnalysis from "./ResultAnalysis"; // We might need this directly later
import LatestAnalysisView from "./LatestAnalysisView"; // <-- Import the new component
import AuthContext from "../../../../context/AuthContext";

const StudentDashboard = () => {
  const { user, logoutAction } = useContext(AuthContext);
  const [activeContent, setActiveContent] = useState("fullTest");
  const renderContent = () => {
    switch (activeContent) {
      case "fullTest":
        return <FullTestPractice />;
      case "analysis":
        return <LatestAnalysisView />;

      case "classroom":
        return <p className="text-gray-300">Classroom feature coming soon.</p>;

      case "notification":
        return (
          <p className="text-gray-300">Notifications feature coming soon.</p>
        );
      default:
        return <FullTestPractice />;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="flex gap-6 h-[calc(100vh-3rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard</h2>
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setActiveContent("fullTest")}
              className={`text-left px-4 py-2 rounded-lg transition ${
                activeContent === "fullTest"
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-blue-600"
              }`}
            >
              Full Test Practice
            </button>
            <button
              onClick={() => setActiveContent("classroom")}
              className={`text-left px-4 py-2 rounded-lg transition ${
                activeContent === "classroom"
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-blue-600"
              }`}
            >
              Classroom
            </button>
            <button
              onClick={() => setActiveContent("notification")}
              className={`text-left px-4 py-2 rounded-lg transition ${
                activeContent === "notification"
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-blue-600"
              }`}
            >
              Notification
            </button>

            {/* --- UPDATED: "Analysis" button is now fully functional --- */}
            <button
              onClick={() => setActiveContent("analysis")}
              className={`text-left px-4 py-2 rounded-lg transition ${
                activeContent === "analysis"
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-blue-600"
              }`}
            >
              Analysis
            </button>
          </nav>
          <div className="mt-auto">
            <button
              onClick={logoutAction}
              className="w-full text-center bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Right side content area */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          <header className="h-16 bg-gray-700 rounded-2xl shadow-md flex items-center justify-between px-6">
            <div className="text-2xl font-bold text-white">
              Welcome, {user?.fullName || "Student"}
            </div>
          </header>
          <main className="flex-1 bg-gray-800 rounded-2xl p-6 shadow-md overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
