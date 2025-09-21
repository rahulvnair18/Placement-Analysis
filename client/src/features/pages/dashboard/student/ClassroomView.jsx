import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";

const ClassroomView = () => {
  const { token } = useContext(AuthContext);

  // State for the form input
  const [joinCode, setJoinCode] = useState("");

  // State to store the list of classrooms the student has joined
  const [joinedClassrooms, setJoinedClassrooms] = useState([]);

  // State for UI feedback
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success/error messages from the join form

  // This function fetches the list of classrooms the student is already in
  const fetchMyClassrooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/student/classrooms/my-classrooms",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch your classrooms.");
      const data = await response.json();
      setJoinedClassrooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the classrooms when the component first loads
  useEffect(() => {
    if (token) {
      fetchMyClassrooms();
    }
  }, [token]);

  // This function handles the "Join Classroom" form submission
  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    setMessage("Joining...");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/student/classrooms/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ joinCode }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage(data.message); // Show success message
      setJoinCode(""); // Clear the input field
      fetchMyClassrooms(); // Refresh the list to show the newly joined classroom
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* --- Join Classroom Form --- */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Join a New Classroom</h2>
        <form
          onSubmit={handleJoinClassroom}
          className="flex items-center gap-4"
        >
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter Join Code"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            Join
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
      </div>

      {/* --- List of Joined Classrooms --- */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Your Classrooms</h2>
        {isLoading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && joinedClassrooms.length === 0 && (
          <p className="text-gray-400">
            You haven't joined any classrooms yet.
          </p>
        )}
        <div className="space-y-4">
          {joinedClassrooms.map((classroom) => (
            <div
              key={classroom._id}
              className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-lg">{classroom.name}</p>
                <p className="text-sm text-gray-400">
                  HOD: {classroom.hodId?.fullName || "N/A"}
                </p>
              </div>
              {/* --- THE CHANGE: Add a "View" button --- */}
              <Link
                to={`/student/classroom/${classroom._id}`}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassroomView;
