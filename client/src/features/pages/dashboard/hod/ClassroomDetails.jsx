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

  // --- NEW: State for the scheduling feature ---
  const [scheduledTests, setScheduledTests] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false); // Controls form visibility
  const [testTitle, setTestTitle] = useState("Placement Mock Test");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");

  // This one function now fetches BOTH classroom details and the list of scheduled tests
  const fetchData = async () => {
    // We don't set loading on every refresh, only the first time.
    if (!isLoading) setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      // Use Promise.all to fetch both pieces of data in parallel for speed
      const [detailsRes, testsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/hod/classrooms/${classroomId}`, {
          headers,
        }),
        fetch(
          `http://localhost:5000/api/hod/classrooms/${classroomId}/scheduled-tests`,
          { headers }
        ),
      ]);

      if (!detailsRes.ok || !testsRes.ok) {
        throw new Error("Failed to fetch all classroom data.");
      }

      const detailsData = await detailsRes.json();
      const testsData = await testsRes.json();

      setClassroom(detailsData);
      setScheduledTests(testsData); // <-- Save the list of tests
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, classroomId]);

  // --- Regenerate Code ---
  const handleRegenerateCode = async () => {
    if (
      !window.confirm("Are you sure you want to regenerate the classroom code?")
    )
      return;
    setIsRegenerating(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/hod/classrooms/${classroomId}/regenerate-code`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to regenerate code.");
      setClassroom((prev) => ({ ...prev, joinCode: data.joinCode }));
      alert("Classroom code regenerated successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  // --- Remove Student ---
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/hod/classrooms/${classroomId}/remove-student/${studentId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
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

  // This function handles submitting the new test schedule
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

      // On success, show message, hide form, and refresh the test list
      setScheduleMessage(data.message);
      setShowScheduleForm(false);
      fetchData(); // Re-fetch all data to show the new test in the list
      setTimeout(() => setScheduleMessage(""), 5000); // Clear message after 5 seconds
    } catch (err) {
      setScheduleMessage(`Error: ${err.message}`);
    }
  };

  // --- Tab Content ---
  const renderContent = () => {
    if (isLoading)
      return <p className="text-gray-400">Loading classroom details...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!classroom) return <p>No classroom data found.</p>;

    switch (activeTab) {
      case "students":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Student Roster ({classroom?.students?.length || 0})
            </h2>
            {classroom?.students?.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">
                      Full Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Roll No
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {classroom.students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-700/50">
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
            ) : (
              <p className="text-gray-400">
                No students have joined this classroom yet.
              </p>
            )}
          </>
        );

      case "scheduleTest":
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Scheduled Tests</h3>
            {/* --- List of Scheduled Tests --- */}
            <div className="space-y-3 mb-6">
              {scheduledTests.length > 0
                ? scheduledTests.map((test) => (
                    <Link
                      key={test._id}
                      to={`/hod/test-analysis/${test._id}`} // 2. It points to our new analysis URL
                      className="block bg-gray-700 p-4 rounded-lg hover:bg-blue-900/50 transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{test.title}</p>
                          <p className="text-sm text-gray-400">
                            Starts: {new Date(test.startTime).toLocaleString()}{" "}
                            | Ends: {new Date(test.endTime).toLocaleString()}
                          </p>
                        </div>
                        {/* 3. A clear "View Results" label */}
                        <div className="text-blue-400 font-semibold">
                          View Results &rarr;
                        </div>
                      </div>
                    </Link>
                  ))
                : !showScheduleForm && (
                    <p className="text-gray-400">
                      No tests have been scheduled for this classroom yet.
                    </p>
                  )}
            </div>

            {/* --- Schedule Test Button / Form --- */}
            {!showScheduleForm ? (
              <button
                onClick={() => setShowScheduleForm(true)}
                className="bg-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-blue-700"
              >
                + Schedule a New Test
              </button>
            ) : (
              <form
                onSubmit={handleScheduleTest}
                className="bg-gray-700 p-6 rounded-lg mt-4 max-w-lg"
              >
                <h4 className="font-bold mb-4">New Test Details</h4>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Test Title</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full bg-gray-800 p-2 rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-gray-800 p-2 rounded"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-gray-800 p-2 rounded"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 py-2 px-6 rounded-lg hover:bg-green-700"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="text-gray-400 hover:text-white"
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
            <h2 className="text-2xl font-bold mb-4">Classroom Settings</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="mb-2">
                <span className="font-semibold">Join Code:</span>{" "}
                <span className="text-green-400">{classroom?.joinCode}</span>
              </p>
              <button
                onClick={handleRegenerateCode}
                disabled={isRegenerating}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex gap-6">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {classroom?.name || "Loading..."}
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Batch: {classroom?.batch}
          </p>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`text-left w-full px-4 py-3 rounded-lg font-semibold ${
                activeTab === "students"
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              Students
            </button>
            {/* --- THE FIX: The "Schedule Test" button is now restored --- */}
            <button
              onClick={() => setActiveTab("scheduleTest")}
              className={`text-left w-full px-4 py-3 rounded-lg font-semibold ${
                activeTab === "scheduleTest"
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              Schedule Test
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`text-left w-full px-4 py-3 rounded-lg font-semibold ${
                activeTab === "settings"
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        <button
          onClick={() => navigate("/hod-dashboard")}
          className="w-full mt-auto px-4 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 transition"
        >
          Back to Dashboard
        </button>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 bg-gray-800 p-8 rounded-2xl shadow-lg overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default ClassroomDetails;
