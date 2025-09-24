import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";
import CreateClassroomModal from "./CreateClassroomModal";

const HodDashboard = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, token, logoutAction } = useContext(AuthContext);

  // --- State for the new features ---
  const [activeView, setActiveView] = useState("classrooms");
  const [hodQuestionStats, setHodQuestionStats] = useState([]);
  const [questionCategory, setQuestionCategory] = useState("Quantitative");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");

  // Fetches BOTH classrooms and question stats
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

      if (!classroomsRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch all required dashboard data.");
      }

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

  // Handler for adding questions to the HOD's private bank
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
          body: JSON.stringify({ category: questionCategory, count: 10 }), // Fixed to 10
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setGenerationMessage(data.message);
      fetchData(); // Refresh stats
    } catch (err) {
      setGenerationMessage(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setGenerationMessage(""), 5000);
      setIsGenerating(false);
    }
  };

  const handleDeleteClassroom = async (classroomId, classroomName) => {
    // This function remains the same
    if (
      !window.confirm(`Are you sure you want to delete "${classroomName}"?`)
    ) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/hod/classrooms/${classroomId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete classroom.");
      fetchData(); // Use fetchData to refresh both classrooms and stats
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Renders different content based on the active view
  const renderContent = () => {
    if (isLoading)
      return <p className="text-gray-300 text-center">Loading...</p>;
    if (error)
      return <p className="text-red-400 text-center">Error: {error}</p>;

    switch (activeView) {
      case "questionBank":
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Your Private Question Bank
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {["Quantitative", "Reasoning", "English", "Programming"].map(
                (sec) => {
                  const stat = hodQuestionStats.find((s) => s._id === sec);
                  return (
                    <div
                      key={sec}
                      className="bg-gray-700 p-4 rounded-lg text-center"
                    >
                      <p className="text-2xl font-bold text-blue-400">
                        {stat ? stat.count : 0}
                      </p>
                      <p className="text-gray-400">{sec}</p>
                    </div>
                  );
                }
              )}
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Add New Questions</h3>
              <div className="flex items-center gap-4">
                <select
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  className="flex-grow bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Quantitative">Quantitative</option>
                  <option value="Reasoning">Reasoning</option>
                  <option value="English">English</option>
                  <option value="Programming">Programming</option>
                </select>
                <button
                  onClick={handleAddQuestions}
                  disabled={isGenerating}
                  className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate 10 Questions"}
                </button>
              </div>
              {generationMessage && (
                <p className="mt-4 text-sm text-green-400">
                  {generationMessage}
                </p>
              )}
            </div>
          </div>
        );
      case "classrooms":
      default:
        return classrooms.length === 0 ? (
          <div className="text-center text-gray-300">
            <p>You haven't created any classrooms yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div
                key={classroom._id}
                className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
              >
                <h3 className="text-xl font-bold mb-2">{classroom.name}</h3>
                <p className="text-gray-400 mb-4">Batch: {classroom.batch}</p>
                <div className="mt-auto flex gap-2 pt-4 border-t border-gray-600">
                  <Link
                    to={`/hod/classroom/${classroom._id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() =>
                      handleDeleteClassroom(classroom._id, classroom.name)
                    }
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                    title="Delete Classroom"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex gap-6">
      <aside className="w-64 bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
        <h2 className="text-2xl font-bold mb-8">HOD Panel</h2>
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => setActiveView("classrooms")}
            className={`text-left px-4 py-2 rounded-lg font-semibold transition ${
              activeView === "classrooms" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            Classrooms
          </button>
          <button
            onClick={() => setActiveView("questionBank")}
            className={`text-left px-4 py-2 rounded-lg font-semibold transition ${
              activeView === "questionBank"
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            Question Bank
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

      <div className="flex-1 flex flex-col gap-6 h-full">
        <header className="h-20 bg-gray-800 rounded-2xl shadow-md flex items-center justify-between px-6">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome, {user?.fullName || "HOD"}
            </h2>
            <p className="text-gray-400 text-sm">
              Manage your classrooms and question banks.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            + Create Classroom
          </button>
        </header>
        <main className="flex-1 bg-gray-800 rounded-2xl p-6 shadow-md overflow-y-auto">
          {renderContent()}
        </main>
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
