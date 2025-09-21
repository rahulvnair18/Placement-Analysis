import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../../../context/AuthContext"; // Adjust path if needed

const AdminDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [activeView, setActiveView] = useState("students");
  const [students, setStudents] = useState([]); // Use [] instead of leaving it empty
  const [hods, setHods] = useState([]); // Use [] instead of leaving it empty
  const [classrooms, setClassrooms] = useState([]); // Use [] instead of leaving it empty
  const [questionStats, setQuestionStats] = useState([]); // Use [] instead of leaving it empty

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the "Add Questions" control panel
  const [questionCategory, setQuestionCategory] = useState("Quantitative");
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");

  const { token, logoutAction } = useContext(AuthContext);

  // --- DATA FETCHING ---
  // This effect runs once when the component mounts to fetch all admin data.
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all three data points in parallel for efficiency
        const [studentsRes, hodsRes, classroomsRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/students", { headers }),
          fetch("http://localhost:5000/api/admin/hods", { headers }),
          fetch("http://localhost:5000/api/admin/classrooms", { headers }),
        ]);

        if (!studentsRes.ok || !hodsRes.ok || !classroomsRes.ok) {
          throw new Error("Failed to fetch some of the required data.");
        }

        const studentsData = await studentsRes.json();
        const hodsData = await hodsRes.json();
        const classroomsData = await classroomsRes.json();

        setStudents(studentsData);
        setHods(hodsData);
        setClassrooms(classroomsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAdminData();
    }
  }, [token]);

  // --- ACTION HANDLERS ---
  const handleAddQuestions = async () => {
    setIsGenerating(true);
    setGenerationMessage(
      `Generating ${questionCount} ${questionCategory} questions...`
    );
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/questions/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: questionCategory,
            count: parseInt(questionCount, 10),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add questions.");
      setGenerationMessage(data.message);
    } catch (err) {
      setGenerationMessage(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setGenerationMessage(""), 5000); // Clear message after 5 seconds
      setIsGenerating(false);
    }
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (isLoading)
      return <p className="text-gray-400 text-center mt-8">Loading data...</p>;
    if (error)
      return <p className="text-red-400 text-center mt-8">Error: {error}</p>;

    switch (activeView) {
      case "students":
        return (
          <div className="overflow-x-auto">
            <h3 className="text-2xl font-bold mb-4">
              All Students ({students.length})
            </h3>
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-3">Full Name</th>
                  <th className="text-left p-3">Registration ID</th>
                  <th className="text-left p-3">Roll No</th>
                  <th className="text-left p-3">Batch</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-gray-800 hover:bg-gray-600"
                  >
                    <td className="p-3">{s.fullName}</td>
                    <td className="p-3">{s.regId}</td>
                    <td className="p-3">{s.rollNo}</td>
                    <td className="p-3">{s.batch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "hods":
        return (
          <div>
            <h3 className="text-2xl font-bold mb-4">
              All HODs ({hods.length})
            </h3>
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-3">Full Name</th>
                  <th className="text-left p-3">Registration ID</th>
                </tr>
              </thead>
              <tbody>
                {hods.map((h) => (
                  <tr
                    key={h._id}
                    className="border-b border-gray-800 hover:bg-gray-600"
                  >
                    <td className="p-3">{h.fullName}</td>
                    <td className="p-3">{h.regId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "classrooms":
        return (
          <div>
            <h3 className="text-2xl font-bold mb-4">
              All Classrooms ({classrooms.length})
            </h3>
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-3">Classroom Name</th>
                  <th className="text-left p-3">HOD</th>
                  <th className="text-left p-3">Student Count</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-gray-800 hover:bg-gray-600"
                  >
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.hodId?.fullName || "N/A"}</td>
                    <td className="p-3">{c.students.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="flex gap-6 h-[calc(100vh-3rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white mb-4">Admin Panel</h2>
          <button
            onClick={() => setActiveView("students")}
            className={`text-left px-4 py-2 rounded-lg transition ${
              activeView === "students"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-blue-600"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveView("hods")}
            className={`text-left px-4 py-2 rounded-lg transition ${
              activeView === "hods"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-blue-600"
            }`}
          >
            HODs
          </button>
          <button
            onClick={() => setActiveView("classrooms")}
            className={`text-left px-4 py-2 rounded-lg transition ${
              activeView === "classrooms"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-blue-600"
            }`}
          >
            Classrooms
          </button>
          <div className="mt-auto">
            <button
              onClick={logoutAction}
              className="w-full text-center bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          <header className="bg-gray-700 rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Tools</h2>
                <p className="text-gray-400">
                  Add new questions to the global question bank.
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-4">
                  <select
                    value={questionCategory}
                    onChange={(e) => setQuestionCategory(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Quantitative">Quantitative</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="English">English</option>
                    <option value="Programming">Programming</option>
                  </select>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-lg w-24 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="50"
                  />
                  <button
                    onClick={handleAddQuestions}
                    disabled={isGenerating}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isGenerating ? "Generating..." : "Generate & Add"}
                  </button>
                </div>
                {generationMessage && (
                  <p className="text-sm text-gray-400 h-5 text-right">
                    {generationMessage}
                  </p>
                )}
              </div>
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

export default AdminDashboard;
