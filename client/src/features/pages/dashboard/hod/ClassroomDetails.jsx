import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";

const ClassroomDetails = () => {
  const { classroomId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("students");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [scheduledTests, setScheduledTests] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [testTitle, setTestTitle] = useState("Placement Mock Test");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");

  const fetchData = async () => {
    if (!isLoading) setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [detailsRes, testsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/hod/classrooms/${classroomId}`, {
          headers,
        }),
        fetch(
          `http://localhost:5000/api/hod/classrooms/${classroomId}/scheduled-tests`,
          { headers }
        ),
      ]);

      if (!detailsRes.ok || !testsRes.ok)
        throw new Error("Failed to fetch classroom data.");

      const detailsData = await detailsRes.json();
      const testsData = await testsRes.json();

      setClassroom(detailsData);
      setScheduledTests(testsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, classroomId]);

  const handleRegenerateCode = async () => {
    if (!window.confirm("Regenerate classroom code?")) return;
    setIsRegenerating(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/hod/classrooms/${classroomId}/regenerate-code`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to regenerate code.");
      setClassroom((prev) => ({ ...prev, joinCode: data.joinCode }));
      alert("Classroom code regenerated!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove this student?")) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/hod/classrooms/${classroomId}/remove-student/${studentId}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to remove student.");
      setClassroom((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s._id !== studentId),
      }));
      alert("Student removed successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScheduleTest = async (e) => {
    e.preventDefault();
    setScheduleMessage("Scheduling...");
    try {
      const response = await fetch(
        `http://localhost:5000/api/hod/classrooms/${classroomId}/schedule-test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: testTitle, startTime, endTime }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setScheduleMessage(data.message);
      setShowScheduleForm(false);
      fetchData();
      setTimeout(() => setScheduleMessage(""), 5000);
    } catch (err) {
      setScheduleMessage(`Error: ${err.message}`);
    }
  };

  const renderContent = () => {
    if (isLoading)
      return <p className="text-orange-200">Loading classroom details...</p>;
    if (error) return <p className="text-red-400">Error: {error}</p>;
    if (!classroom) return <p>No classroom data found.</p>;

    switch (activeTab) {
      case "students":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-orange-300">
              Student Roster ({classroom?.students?.length || 0})
            </h2>
            {classroom?.students?.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-orange-200">
                        Full Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-orange-200">
                        Roll No
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {classroom.students.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-white/10 transition"
                      >
                        <td className="py-3 px-4">{student.fullName}</td>
                        <td className="py-3 px-4">{student.rollNo}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRemoveStudent(student._id)}
                            className="bg-red-600 px-3 py-1 rounded-lg hover:bg-red-500 transition"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-orange-200">No students have joined yet.</p>
            )}
          </>
        );

      case "scheduleTest":
        return (
          <div>
            <h3 className="text-xl font-bold mb-4 text-orange-300">
              Scheduled Tests
            </h3>
            <div className="space-y-3 mb-6">
              {scheduledTests.length > 0
                ? scheduledTests.map((test) => (
                    // --- THIS IS THE UPDATED SECTION ---
                    // The outer element is now a simple div, not a link.
                    <div
                      key={test._id}
                      className="p-4 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-white">{test.title}</p>
                        <p className="text-sm text-orange-200">
                          Starts: {new Date(test.startTime).toLocaleString()} |
                          Ends: {new Date(test.endTime).toLocaleString()}
                        </p>
                      </div>

                      {/* The "View Results" is now a Link styled as a button */}
                      <Link
                        to={`/hod/test-analysis/${test._id}`}
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                      >
                        View Results
                      </Link>
                    </div>
                  ))
                : !showScheduleForm && (
                    <p className="text-orange-200">No tests scheduled yet.</p>
                  )}
            </div>

            {!showScheduleForm ? (
              <button
                onClick={() => setShowScheduleForm(true)}
                className="bg-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 shadow-md"
              >
                + Schedule a New Test
              </button>
            ) : (
              <form
                onSubmit={handleScheduleTest}
                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl mt-4 max-w-lg shadow-lg border border-white/20"
              >
                <h4 className="font-bold mb-4 text-orange-300">
                  New Test Details
                </h4>
                <div className="mb-4">
                  <label className="block text-orange-200 mb-2">
                    Test Title
                  </label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full bg-white/10 p-2 rounded text-white backdrop-blur-sm border border-white/20"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-orange-200 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white/10 p-2 rounded text-white backdrop-blur-sm border border-white/20"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-orange-200 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white/10 p-2 rounded text-white backdrop-blur-sm border border-white/20"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    className="bg-orange-600 py-2 px-6 rounded-lg hover:bg-orange-500 shadow-md"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="text-orange-200 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                {scheduleMessage && (
                  <p className="mt-4 text-sm text-green-400">
                    {scheduleMessage}
                  </p>
                )}
              </form>
            )}
          </div>
        );

      case "settings":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-orange-300">
              Classroom Settings
            </h2>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
              <p className="mb-2">
                <span className="font-semibold text-orange-200">
                  Join Code:
                </span>{" "}
                <span className="text-green-400">{classroom?.joinCode}</span>
              </p>
              <button
                onClick={handleRegenerateCode}
                disabled={isRegenerating}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md"
              >
                {isRegenerating ? "Regenerating..." : "Regenerate Code"}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-orange-800 text-white p-6 flex gap-6">
      <aside className="w-64 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 flex flex-col">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-orange-300">
            {classroom?.name || "Loading..."}
          </h2>
          <p className="text-orange-200 text-sm mb-8">
            Batch: {classroom?.batch}
          </p>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`text-left w-full px-4 py-3 rounded-lg font-semibold ${
                activeTab === "students"
                  ? "bg-blue-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("scheduleTest")}
              className={`text-left w-full px-4 py-3 rounded-lg font-semibold ${
                activeTab === "scheduleTest"
                  ? "bg-blue-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Schedule Test
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`text-left w-full px-4 py-3 rounded-lg font-semibold ${
                activeTab === "settings"
                  ? "bg-blue-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        <button
          onClick={() => navigate("/hod-dashboard")}
          className="w-full mt-auto px-4 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 transition shadow-md"
        >
          Back to Dashboard
        </button>
      </aside>

      <main className="flex-1 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default ClassroomDetails;
