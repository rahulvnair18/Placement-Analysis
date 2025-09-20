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

  // This function fetches the HOD's classrooms. It is correct.
  const fetchClassrooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/hod/classrooms/my-classrooms",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch classrooms.");
      const data = await response.json();
      setClassrooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchClassrooms();
  }, [token]);

  // This function handles deleting a classroom. It is correct.
  const handleDeleteClassroom = async (classroomId, classroomName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the classroom "${classroomName}"? This action cannot be undone.`
      )
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
      fetchClassrooms(); // Refresh the list after deleting
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const renderContent = () => {
    if (isLoading)
      return (
        <p className="text-gray-400 text-center">Loading your classrooms...</p>
      );
    if (error)
      return <p className="text-red-500 text-center">Error: {error}</p>;

    if (classrooms.length === 0) {
      return (
        <div className="text-center">
          <p className="text-gray-400">
            You haven't created any classrooms yet. Click "+ Create
            Classroom" to begin.
          </p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <div
            key={classroom._id}
            className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
          >
            <h3 className="text-xl font-bold mb-2">{classroom.name}</h3>
            <p className="text-gray-400 mb-4">Batch: {classroom.batch}</p>

            {/* The insecure join code display has been permanently removed */}

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
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="flex gap-6 h-[calc(100vh-3rem)]">
        <aside className="w-64 bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white mb-4">HOD Panel</h2>
          <nav className="flex flex-col gap-4">
            <button
              className="text-left px-4 py-2 rounded-lg transition bg-blue-600"
            >
              Classrooms
            </button>
            {/* --- THE FIX: The "Schedule Test" button has been removed --- */}
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
          <header className="h-20 bg-gray-700 rounded-2xl shadow-md flex items-center justify-between px-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Welcome, {user?.fullName || "HOD"}
              </h2>
              <p className="text-gray-400 text-sm">
                Manage your classrooms and student performance.
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
      </div>

      {isModalOpen && (
        <CreateClassroomModal
          onClose={() => setIsModalOpen(false)}
          onClassroomCreated={fetchClassrooms}
        />
      )}
    </div>
  );
};

export default HodDashboard;

