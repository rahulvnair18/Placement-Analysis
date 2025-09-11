import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 1. Create the context
const AuthContext = createContext();

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // --- NEW --- The clear "Yes/No" flag our guards need.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // --- NEW --- A loading state to prevent race conditions on app load.
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // This effect runs ONLY ONCE when the app starts.
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      // If we find a user, update the state to "logged in".
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    // This is crucial: we are now finished with the initial check.
    setIsLoading(false);
  }, []); // The empty array [] means this runs only once on mount.

  // 3. Login function
  const loginAction = async (regId, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const userData = {
        id: data.userId,
        fullName: data.fullName,
        role: data.role,
      };

      // Update state and localStorage after successful login
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
      setUser(userData);
      setToken(data.token);
      setIsAuthenticated(true); // --- NEW --- Set our flag to true

      // Redirect
      if (data.role === "Student") navigate("/student-dashboard");
      else if (data.role === "HOD") navigate("/hod-dashboard");
      else if (data.role === "Admin") navigate("/admin-dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // 4. Logout function
  const logoutAction = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false); // --- NEW --- Set our flag to false
    navigate("/login");
  };

  // 5. The value provided to all children components
  const value = {
    user,
    token,
    isAuthenticated, // --- NEW --- Provide the flag
    isLoading, // --- NEW --- Provide the loading state
    loginAction,
    logoutAction,
  };

  // While we're checking for a user, don't render the app. This prevents glitches.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        Loading Application...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 6. Export the context
export default AuthContext;
