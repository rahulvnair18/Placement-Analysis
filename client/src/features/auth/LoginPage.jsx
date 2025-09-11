import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext"; // <-- Import the context

const LoginPage = () => {
  const [regId, setRegId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For displaying errors

  // Get the loginAction function from our context "brain"
  const { loginAction } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!regId || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Call the loginAction from the context
      await loginAction(regId, password);
      // Navigation is now handled inside loginAction!
    } catch (err) {
      setError(err.message || "Something went wrong during login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin}>
          {/* Display error message if there is one */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Registration ID</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter regId"
              value={regId}
              onChange={(e) => setRegId(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          New user?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
