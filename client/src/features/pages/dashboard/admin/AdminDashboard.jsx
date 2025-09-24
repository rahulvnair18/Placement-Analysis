import React, { useState, useEffect, useContext, useRef } from "react";
import AuthContext from "../../../../context/AuthContext";

const AdminDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [activeView, setActiveView] = useState("students");
  const [students, setStudents] = useState([]);
  const [hods, setHods] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [questionCategory, setQuestionCategory] = useState("Quantitative");
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");

  const { token, logoutAction } = useContext(AuthContext);

  // Refs for GSAP animations
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` };
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

    if (token) fetchAdminData();

    // GSAP animations
    import("gsap").then((gsap) => {
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
      setTimeout(() => setGenerationMessage(""), 5000);
      setIsGenerating(false);
    }
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (isLoading)
      return <p className="text-gray-200 text-center mt-8">Loading data...</p>;
    if (error)
      return <p className="text-red-400 text-center mt-8">Error: {error}</p>;

    switch (activeView) {
      case "students":
        return (
          <div className="overflow-x-auto">
            <h3 className="text-2xl font-bold text-orange-300 mb-4">
              All Students ({students.length})
            </h3>
            <table className="min-w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <thead>
                <tr className="border-b border-white/20">
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
                    className="border-b border-white/10 hover:bg-blue-900/30"
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
            <h3 className="text-2xl font-bold text-orange-300 mb-4">
              All HODs ({hods.length})
            </h3>
            <table className="min-w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3">Full Name</th>
                  <th className="text-left p-3">Registration ID</th>
                </tr>
              </thead>
              <tbody>
                {hods.map((h) => (
                  <tr
                    key={h._id}
                    className="border-b border-white/10 hover:bg-blue-900/30"
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
            <h3 className="text-2xl font-bold text-orange-300 mb-4">
              All Classrooms ({classrooms.length})
            </h3>
            <table className="min-w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3">Classroom Name</th>
                  <th className="text-left p-3">HOD</th>
                  <th className="text-left p-3">Student Count</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-white/10 hover:bg-blue-900/30"
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      <div className="relative z-10 flex gap-6 p-6 h-[calc(100vh-1rem)]">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className="w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
        >
          <h2 className="text-3xl font-extrabold text-orange-400 mb-6 drop-shadow-lg">
            Admin Panel
          </h2>
          <nav className="flex flex-col gap-4">
            {["students", "hods", "classrooms"].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`text-left px-4 py-2 rounded-lg font-semibold transition-all border ${
                  activeView === view
                    ? "bg-blue-600 border-orange-400 shadow-lg scale-105"
                    : "bg-white/10 border-white/20 hover:bg-blue-500/40"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </nav>
          <div className="mt-auto">
            <button
              onClick={logoutAction}
              className="w-full text-center bg-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition shadow-md"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          <header
            ref={headerRef}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h2 className="text-2xl font-bold text-orange-300 drop-shadow-md">
                Admin Tools
              </h2>
              <p className="text-gray-200 text-sm">
                Add new questions to the global question bank.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <select
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="bg-white/10 border border-white/20 rounded-lg w-24 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="text-sm text-gray-200 h-5 text-right">
                {generationMessage}
              </p>
            )}
          </header>

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

export default AdminDashboard;
