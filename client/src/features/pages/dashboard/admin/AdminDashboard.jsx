import React, { useState, useEffect, useContext, useRef } from "react";
import AuthContext from "../../../../context/AuthContext";

const AdminDashboard = () => {
  // --- STATE MANAGEMENT (Unchanged) ---
  const [activeView, setActiveView] = useState("questionStats");
  const [students, setStudents] = useState([]);
  const [hods, setHods] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionStats, setQuestionStats] = useState([]);
  const [questionCategory, setQuestionCategory] = useState("Quantitative");
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");

  const { token, logoutAction } = useContext(AuthContext);

  // Refs for GSAP animations (Unchanged)
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  // --- DATA FETCHING (Unchanged) ---
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [studentsRes, hodsRes, classroomsRes, statsRes] =
          await Promise.all([
            fetch("http://localhost:5000/api/admin/students", { headers }),
            fetch("http://localhost:5000/api/admin/hods", { headers }),
            fetch("http://localhost:5000/api/admin/classrooms", { headers }),
            fetch("http://localhost:5000/api/admin/questions/stats", {
              headers,
            }), // <-- Fetch stats
          ]);

        if (
          !studentsRes.ok ||
          !hodsRes.ok ||
          !classroomsRes.ok ||
          !statsRes.ok
        ) {
          throw new Error("Failed to fetch some of the required data.");
        }

        const studentsData = await studentsRes.json();
        const hodsData = await hodsRes.json();
        const classroomsData = await classroomsRes.json();
        const statsData = await statsRes.json();

        setStudents(studentsData);
        setHods(hodsData);
        setClassrooms(classroomsData);
        setQuestionStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchAdminData();

    // GSAP animations (Unchanged)
    import("gsap").then(({ gsap }) => {
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
    });
  }, [token]);
  const handleRemoveAdminQuestions = async (section = null) => {
    const confirmMessage = section
      ? `Are you sure you want to delete all questions from the ${section} section?`
      : "Are you sure you want to delete ALL questions from the global bank? This action cannot be undone.";

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/questions",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: section ? JSON.stringify({ section }) : JSON.stringify({}),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(data.message); // Show success message
      // This is a simple way to refresh the data after deletion
      window.location.reload();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  // --- ACTION HANDLERS (Unchanged) ---
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
      setTimeout(() => setGenerationMessage(""), 5000);
      setIsGenerating(false);
    }
  };

  // --- RENDER LOGIC (Styling Updated) ---
  const renderContent = () => {
    if (isLoading)
      return <p className="text-gray-300 text-center mt-8">Loading data...</p>;
    if (error)
      return <p className="text-red-400 text-center mt-8">Error: {error}</p>;

    const tableBaseClass = "min-w-full bg-black/10 rounded-xl text-white";
    const thClass =
      "text-left p-4 font-semibold text-gray-300 border-b border-white/20";
    const tdClass = "p-4";
    const trClass =
      "border-b border-white/10 hover:bg-white/5 transition-colors";
    const tableTitleClass = "text-2xl font-bold text-orange-300 mb-4";

    switch (activeView) {
      case "questionStats":
        const totalQuestions = questionStats.reduce(
          (acc, curr) => acc + curr.count,
          0
        );
        return (
          <div>
            <div className="bg-black/20 p-6 rounded-xl flex items-center justify-between mb-8">
              <div>
                <p className="text-gray-300">Total Questions in Bank</p>
                <p className="text-4xl font-bold text-orange-300">
                  {totalQuestions}
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-orange-300 mb-4">
              Questions by Section
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {questionStats.map((stat) => (
                // --- THE STAT CARD IS NOW A FLEX COLUMN ---
                <div
                  key={stat._id}
                  className="bg-black/20 p-6 rounded-xl text-center flex flex-col justify-between"
                >
                  <div>
                    <p className="text-3xl font-bold text-blue-400">
                      {stat.count}
                    </p>
                    <p className="text-gray-300 mt-1">{stat._id}</p>
                  </div>
                  {/* --- THE NEW DELETE BUTTON --- */}
                  <button
                    onClick={() => handleRemoveAdminQuestions(stat._id)}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded mt-4 py-1 transition-colors"
                    title={`Delete all ${stat._id} questions`}
                  >
                    Delete Section
                  </button>
                </div>
              ))}
            </div>

            {/* --- NEW "DELETE ALL" SECTION --- */}
            <div className="mt-8 bg-red-900/40 p-6 rounded-lg border border-red-700 text-center">
              <h3 className="text-xl font-bold text-red-300 mb-2">
                Danger Zone
              </h3>
              <p className="text-red-200 mb-4">
                Permanently remove all questions from the global question bank.
              </p>
              <button
                onClick={() => handleRemoveAdminQuestions()} // No section passed to delete all
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition"
              >
                Delete All Questions
              </button>
            </div>
          </div>
        );

      case "students":
        return (
          <div className="overflow-x-auto">
            <h3 className={tableTitleClass}>
              All Students ({students.length})
            </h3>
            <table className={tableBaseClass}>
              <thead>
                <tr className="border-b border-white/20">
                  <th className={thClass}>Full Name</th>
                  <th className={thClass}>Registration ID</th>
                  <th className={thClass}>Roll No</th>
                  <th className={thClass}>Batch</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className={trClass}>
                    <td className={tdClass}>{s.fullName}</td>
                    <td className={tdClass}>{s.regId}</td>
                    <td className={tdClass}>{s.rollNo}</td>
                    <td className={tdClass}>{s.batch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "hods":
        return (
          <div className="overflow-x-auto">
            <h3 className={tableTitleClass}>All HODs ({hods.length})</h3>
            <table className={tableBaseClass}>
              <thead>
                <tr className="border-b border-white/20">
                  <th className={thClass}>Full Name</th>
                  <th className={thClass}>Registration ID</th>
                </tr>
              </thead>
              <tbody>
                {hods.map((h) => (
                  <tr key={h._id} className={trClass}>
                    <td className={tdClass}>{h.fullName}</td>
                    <td className={tdClass}>{h.regId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "classrooms":
        return (
          <div className="overflow-x-auto">
            <h3 className={tableTitleClass}>
              All Classrooms ({classrooms.length})
            </h3>
            <table className={tableBaseClass}>
              <thead>
                <tr className="border-b border-white/20">
                  <th className={thClass}>Classroom Name</th>
                  <th className={thClass}>HOD</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c) => (
                  <tr key={c._id} className={trClass}>
                    <td className={tdClass}>{c.name}</td>
                    <td className={tdClass}>{c.hodId?.fullName || "N/A"}</td>
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

  const cardStyle =
    "bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl";

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      <div className="relative z-10 flex gap-6 p-6 h-screen">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`${cardStyle} w-64 p-6 flex flex-col gap-4`}
        >
          <h2 className="text-3xl font-extrabold text-orange-400 mb-6 drop-shadow-lg">
            Admin Panel
          </h2>
          <nav className="flex flex-col gap-4">
            {["questionStats", "students", "hods", "classrooms"].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`text-left px-4 py-2 rounded-lg font-semibold transition-all border ${
                  activeView === view
                    ? "bg-blue-600 border-orange-400 shadow-lg scale-105"
                    : "bg-white/10 border-transparent hover:bg-white/20"
                }`}
              >
                {/* Simple text formatting */}
                {view === "questionStats"
                  ? "Question Stats"
                  : view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </nav>
          <div className="mt-auto">
            <button
              onClick={logoutAction}
              className="w-full text-center bg-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
          <header ref={headerRef} className={`${cardStyle} p-6`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-orange-300 drop-shadow-md">
                  Admin Tools
                </h2>
                <p className="text-gray-300 text-sm">
                  Add new questions to the global question bank.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <select
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  className="bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option>Quantitative</option>
                  <option>Reasoning</option>
                  <option>English</option>
                  <option>Programming</option>
                </select>
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="bg-black/20 border border-white/20 rounded-lg w-full sm:w-24 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
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
            </div>
            {generationMessage && (
              <p className="text-sm text-gray-300 h-5 mt-2 text-right">
                {generationMessage}
              </p>
            )}
          </header>

          <main
            ref={contentRef}
            className={`${cardStyle} flex-1 p-6 overflow-y-auto`}
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
