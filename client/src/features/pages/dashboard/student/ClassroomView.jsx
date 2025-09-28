import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";

const ClassroomView = () => {
  const { token } = useContext(AuthContext);

  const [joinCode, setJoinCode] = useState("");
  const [joinedClassrooms, setJoinedClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    if (token) {
      fetchMyClassrooms();
    }
  }, [token]);

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

      setMessage(data.message);
      setJoinCode("");
      fetchMyClassrooms();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 animate-gradient-x"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto p-8 space-y-10">
        {/* Join Classroom Form */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join a New Classroom
          </h2>
          <form
            onSubmit={handleJoinClassroom}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter Join Code"
              className="flex-grow bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-300"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 hover:scale-105 transition-all shadow-lg"
            >
              Join
            </button>
          </form>
          {message && (
            <p className="mt-4 text-sm text-green-400 font-medium">{message}</p>
          )}
        </div>

        {/* Classrooms List */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">
            Your Classrooms
          </h2>
          {isLoading && <p className="text-gray-300">Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!isLoading && joinedClassrooms.length === 0 && (
            <p className="text-gray-300">
              You haven’t joined any classrooms yet.
            </p>
          )}

          <div className="space-y-4">
            {joinedClassrooms.map((classroom, idx) => (
              <div
                key={classroom._id}
                className={`p-6 rounded-xl flex justify-between items-center border transition-all shadow-md
                  ${idx % 2 === 0 ? "bg-white/10" : "bg-white/5"}
                  hover:bg-orange-500/20 hover:scale-[1.02]`}
              >
                <div>
                  <p className="font-bold text-xl text-white">
                    {classroom.name}
                  </p>
                  <p className="text-sm text-gray-300">
                    HOD: {classroom.hodId?.fullName || "N/A"}
                  </p>
                </div>
                <Link
                  to={`/student/classroom/${classroom._id}`}
                  className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 hover:scale-105 transition-all shadow-md text-sm"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomView;
