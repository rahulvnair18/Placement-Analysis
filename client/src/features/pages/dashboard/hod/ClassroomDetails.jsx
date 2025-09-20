import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";

const ClassroomDetails = () => {
  const { classroomId } = useParams();
  const { token } = useContext(AuthContext);

  const [classroom, setClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("students"); // 👈 tabs: students | settings
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Fetch classroom details
  const fetchClassroomDetails = async () => {
    if (!token || !classroomId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/hod/classrooms/${classroomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch classroom details.");
      const data = await response.json();
      setClassroom(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomDetails();
  }, [token, classroomId]);

  // Handle regenerate code
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
      // Update classroom state with new code
      setClassroom((prev) => ({ ...prev, joinCode: data.joinCode }));
      alert("Classroom code regenerated successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };
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

      // ✅ Update state immediately without reloading full page
      setClassroom((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s._id !== studentId),
      }));

      alert("Student removed successfully!");
    } catch (err) {
      alert(err.message);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white text-2xl p-10">
        Loading Classroom Details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-red-500 text-2xl p-10">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex gap-6">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">{classroom?.name}</h2>
        <p className="text-gray-400 text-sm mb-6">Batch: {classroom?.batch}</p>

        <button
          onClick={() => setActiveTab("students")}
          className={`text-left px-4 py-2 rounded-lg transition ${
            activeTab === "students" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Students
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`text-left px-4 py-2 rounded-lg transition ${
            activeTab === "settings" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Settings
        </button>

        <Link
          to="/hod-dashboard"
          className="mt-auto text-center bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Back to Dashboard
        </Link>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 bg-gray-800 p-6 rounded-2xl shadow-lg overflow-y-auto">
        {activeTab === "students" && (
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
        )}

        {activeTab === "settings" && (
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
        )}
      </main>
    </div>
  );
};

export default ClassroomDetails;
