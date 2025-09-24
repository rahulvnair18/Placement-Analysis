import React, { useState, useContext, useEffect, useRef } from "react";
import gsap from "gsap";
import FullTestPractice from "./FullTestPractice";
import LatestAnalysisView from "./LatestAnalysisView";
import ClassroomView from "./ClassroomView";
import AuthContext from "../../../../context/AuthContext";

const StudentDashboard = () => {
  const { user, logoutAction } = useContext(AuthContext);
  const [activeContent, setActiveContent] = useState("fullTest");

  // Refs for animations
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Animate on load
    gsap.fromTo(
      sidebarRef.current,
      { x: -200, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    );
    gsap.fromTo(
      headerRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" }
    );
    gsap.fromTo(
      contentRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, delay: 0.5, ease: "power3.out" }
    );
  }, []);

  const renderContent = () => {
    switch (activeContent) {
      case "fullTest":
        return <FullTestPractice />;
      case "classroom":
        return <ClassroomView />;
      case "analysis":
        return <LatestAnalysisView />;
      default:
        return <FullTestPractice />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 animate-gradient-x"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Dashboard Layout */}
      <div className="relative z-10 flex gap-6 p-6 h-[calc(100vh-1rem)]">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className="w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
        >
          <h2 className="text-3xl font-extrabold text-orange-400 mb-6 drop-shadow-lg">
            ProLearn
          </h2>
          <nav className="flex flex-col gap-4">
            {["fullTest", "classroom", "analysis"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveContent(tab)}
                className={`text-left px-4 py-2 rounded-lg font-semibold transition-all border ${
                  activeContent === tab
                    ? "bg-blue-600 border-orange-400 shadow-lg scale-105"
                    : "bg-white/10 border-white/20 hover:bg-blue-500/40"
                }`}
              >
                {tab === "fullTest"
                  ? "Full Test Practice"
                  : tab === "classroom"
                  ? "Classroom"
                  : "Analysis"}
              </button>
            ))}
          </nav>
          <div className="mt-auto">
            <button
              onClick={logoutAction}
              className="w-full text-center bg-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          {/* Header */}
          <header
            ref={headerRef}
            className="h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg flex items-center justify-between px-6"
          >
            <div className="text-2xl font-bold text-orange-300 drop-shadow-md">
              Welcome, {user?.fullName || "Student"}
            </div>
          </header>

          {/* Main Content */}
          <main
            ref={contentRef}
            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl overflow-y-auto"
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
