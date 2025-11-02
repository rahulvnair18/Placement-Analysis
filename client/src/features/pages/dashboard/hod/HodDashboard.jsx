import React, { useState, useEffect, useContext, useRef } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";

import AuthContext from "../../../../context/AuthContext";
import CreateClassroomModal from "./CreateClassroomModal";

const HodDashboard = () => {
  const { user, token, logoutAction } = useContext(AuthContext);
  const [activeView, setActiveView] = useState("classrooms");
  const [classrooms, setClassrooms] = useState([]);
  const [hodQuestionStats, setHodQuestionStats] = useState([]);
  const [questionCategory, setQuestionCategory] = useState("Quantitative");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs for animation
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Animate dashboard components
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

  // Fetch classrooms and question stats
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [classroomsRes, statsRes] = await Promise.all([
        fetch("http://localhost:5000/api/hod/classrooms/my-classrooms", {
          headers,
        }),
        fetch("http://localhost:5000/api/hod/questions/stats", { headers }),
      ]);

      if (!classroomsRes.ok || !statsRes.ok)
        throw new Error("Failed to fetch dashboard data.");

      const classroomsData = await classroomsRes.json();
      const statsData = await statsRes.json();

      setClassrooms(classroomsData);
      setHodQuestionStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAddQuestions = async () => {
    setIsGenerating(true);
    setGenerationMessage(`Generating 10 ${questionCategory} questions...`);
    try {
      const response = await fetch(
        "http://localhost:5000/api/hod/questions/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category: questionCategory, count: 10 }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setGenerationMessage(data.message);
      fetchData();
    } catch (err) {
      setGenerationMessage(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setGenerationMessage(""), 5000);
      setIsGenerating(false);
    }
  };

  const handleDeleteClassroom = async (classroomId, classroomName) => {
    if (!window.confirm(`Are you sure you want to delete "${classroomName}"?`))
      return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/hod/classrooms/${classroomId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete classroom.");
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  // --- THIS IS THE NEW FUNCTION FOR DELETING QUESTIONS ---
  const handleRemoveQuestions = async (section = null) => {
    const confirmMessage = section
      ? `Are you sure you want to delete all questions from the ${section} section?`
      : "Are you sure you want to delete ALL questions from your bank? This action cannot be undone.";

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch("http://localhost:5000/api/hod/questions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // If a section is provided, send it in the body
        body: section ? JSON.stringify({ section }) : JSON.stringify({}),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(data.message); // Show success message
      fetchData(); // Refresh the stats
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  const renderContent = () => {
    if (isLoading)
      return <p className="text-orange-200 text-center">Loading...</p>;
    if (error) return <p className="text-red-400 text-center">{error}</p>;

    switch (activeView) {
      case "questionBank":
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-orange-100">
              Your Private Question Bank
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {["Quantitative", "Reasoning", "English", "Programming"].map(
                (sec) => {
                  const stat = hodQuestionStats.find((s) => s._id === sec);
                  return (
                    <div
                      key={sec}
                      className="bg-blue-900/40 p-4 rounded-lg text-center border border-blue-700 flex flex-col justify-between"
                    >
                      <div>
                        <p className="text-2xl font-bold text-orange-400">
                          {stat ? stat.count : 0}
                        </p>
                        <p className="text-orange-200">{sec}</p>
                      </div>
                      {/* --- THE NEW DELETE BUTTON --- */}
                      <button
                        onClick={() => handleRemoveQuestions(sec)}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded mt-3 py-1 transition"
                        title={`Delete all ${sec} questions`}
                      >
                        Delete Section
                      </button>
                    </div>
                  );
                }
              )}
            </div>

            <div className="bg-blue-900/40 p-6 rounded-lg border border-blue-700">
              <h3 className="text-xl font-bold mb-4 text-orange-100">
                Add New Questions
              </h3>
              <div className="flex items-center gap-4">
                <select
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  className="flex-grow bg-blue-800 border border-blue-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
                >
                  <option value="Quantitative">Quantitative</option>
                  <option value="Reasoning">Reasoning</option>
                  <option value="English">English</option>
                  <option value="Programming">Programming</option>
                </select>
                <button
                  onClick={handleAddQuestions}
                  disabled={isGenerating}
                  className="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate 10 Questions"}
                </button>
              </div>
              {generationMessage && (
                <p className="mt-4 text-sm text-orange-300">
                  {generationMessage}
                </p>
              )}
            </div>
            {/* --- NEW "DELETE ALL" SECTION --- */}
            <div className="mt-8 bg-red-900/40 p-6 rounded-lg border border-red-700 text-center">
              <p className="text-red-200 mb-4">
                Permanently remove all questions from your question bank.
              </p>
              <button
                onClick={() => handleRemoveQuestions()} // No section passed to delete all
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition"
              >
                Delete All My Questions
              </button>
            </div>
          </div>
        );

      case "classrooms":
      default:
        return classrooms.length === 0 ? (
          <div className="text-center text-orange-200">
            You haven't created any classrooms yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div
                key={classroom._id}
                className="bg-blue-900/40 p-6 rounded-lg shadow-md flex flex-col border border-blue-700"
              >
                <h3 className="text-xl font-bold mb-2 text-orange-100">
                  {classroom.name}
                </h3>
                <p className="text-orange-200 mb-4">Batch: {classroom.batch}</p>
                <div className="mt-auto flex gap-2 pt-4 border-t border-blue-700">
                  <Link
                    to={`/hod/classroom/${classroom._id}`}
                    className="flex-1 bg-orange-600 text-white text-center py-2 rounded-lg hover:bg-orange-700 transition text-sm font-semibold"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() =>
                      handleDeleteClassroom(classroom._id, classroom.name)
                    }
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 animate-gradient-x"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      <div className="relative z-10 flex gap-6 p-6 h-[calc(100vh-1rem)]">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className="w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
        >
          <h2 className="text-3xl font-extrabold text-orange-400 mb-6 drop-shadow-lg">
            HOD Panel
          </h2>
          <nav className="flex flex-col gap-4">
            {["classrooms", "questionBank"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveView(tab)}
                className={`text-left px-4 py-2 rounded-lg font-semibold transition-all border ${
                  activeView === tab
                    ? "bg-blue-600 border-orange-400 shadow-lg scale-105"
                    : "bg-white/10 border-white/20 hover:bg-blue-500/40"
                }`}
              >
                {tab === "classrooms" ? "Classrooms" : "Question Bank"}
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
          <header
            ref={headerRef}
            className="h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg flex items-center justify-between px-6"
          >
            <div className="text-2xl font-bold text-orange-300 drop-shadow-md">
              Welcome, {user?.fullName || "HOD"}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-700 transition"
            >
              + Create Classroom
            </button>
          </header>

          <main
            ref={contentRef}
            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl overflow-y-auto"
          >
            {renderContent()}
          </main>
        </div>
      </div>

      {isModalOpen && (
        <CreateClassroomModal
          onClose={() => setIsModalOpen(false)}
          onClassroomCreated={fetchData}
        />
      )}
    </div>
  );
};

export default HodDashboard;
