import React, { useState, useContext } from "react";
import AuthContext from "../../../../context/AuthContext";

const CreateClassroomModal = ({ onClose, onClassroomCreated }) => {
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !batch) {
      setError("Both fields are required.");
      return;
    }
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/hod/classrooms/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, batch }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create classroom.");

      onClassroomCreated(); // Refresh dashboard
      onClose(); // Close modal
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 rounded-xl p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-md">
          Create New Classroom
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-orange-200 mb-2 font-semibold"
            >
              Classroom Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., MCA Placement Prep 2025"
              className="w-full bg-white/10 border border-orange-300 text-white placeholder-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="batch"
              className="block text-orange-200 mb-2 font-semibold"
            >
              Batch
            </label>
            <input
              type="text"
              id="batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="e.g., 2023-2025"
              className="w-full bg-white/10 border border-orange-300 text-white placeholder-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-orange-600 text-white py-2 px-6 rounded-lg hover:bg-orange-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassroomModal;
