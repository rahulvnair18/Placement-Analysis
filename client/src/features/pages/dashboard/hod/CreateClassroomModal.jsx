import React, { useState, useContext } from "react";
import AuthContext from "../../../../context/AuthContext";

// This component receives two functions as props:
// - onClose: A function to tell the dashboard to close this modal.
// - onClassroomCreated: A function to tell the dashboard to refresh its list of classrooms.
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
      if (!response.ok) {
        throw new Error(data.message || "Failed to create classroom.");
      }

      onClassroomCreated(); // Tell the dashboard to refresh its list.
      onClose(); // Close the modal on success.
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    // This creates the dark overlay and centers the modal
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Create New Classroom</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-400 mb-2">
              Classroom Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., MCA Placement Prep 2025"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="batch" className="block text-gray-400 mb-2">
              Batch
            </label>
            <input
              type="text"
              id="batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2023-2025"
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 py-2 px-6 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="bg-blue-600 py-2 px-6 rounded-lg hover:bg-blue-500 disabled:opacity-50"
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
