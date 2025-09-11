import React, { useState } from "react";
import FullTestPractice from "./FullTestPractice";

const StudentDashboard = () => {
  const [activeContent, setActiveContent] = useState("fullTest");
  const renderContent = () => {
    switch (activeContent) {
      case "fullTest":
        return <FullTestPractice />;
      case "practice":
        return <p className="text-gray-300">Practice content goes here.</p>;
      // Add more cases for other options
      default:
        return (
          <p className="text-gray-300">Select an option from the sidebar.</p>
        );
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Outer flex container that fills full height */}
      <div className="flex gap-6 h-[calc(100vh-3rem)]">
        {/* Sidebar - full height with spacing & rounded corners */}
        <aside className="w-64 bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 h-full">
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard</h2>
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setActiveContent("fullTest")}
              className="text-left bg-gray-700 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Full Test Practice
            </button>
            <button className="text-left bg-gray-700 px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              Classroom
            </button>
            <button className="text-left bg-gray-700 px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              Notification
            </button>
            <button className="text-left bg-gray-700 px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              Analysis
            </button>
          </nav>
        </aside>

        {/* Right side with top navbar and main content */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          {/* Top Navbar */}
          <header className="h-16 bg-gray-700 rounded-2xl shadow-md flex items-center justify-between px-6">
            {/* Welcome message on the left */}
            <div className="text-2xl font-bold text-white">Welcome</div>

            {/* Account link on the right */}
            <a
              href="/account"
              className="text-sm font-medium text-blue-400 hover:underline hover:text-blue-300 transition"
            >
              Logout
            </a>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-gray-800 rounded-2xl p-6 shadow-md overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
