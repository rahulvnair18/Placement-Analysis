import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

// This component is our "security guard"
const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  // 1. Check if the user is logged in
  if (!user) {
    // If not, redirect them to the login page
    return <Navigate to="/login" />;
  }

  // 2. (Optional but good practice) Check if the user has the required role
  if (role && user.role !== role) {
    // If they are logged in but have the wrong role (e.g., a student trying to access HOD page)
    // redirect them to their own dashboard or a generic "unauthorized" page.
    // For now, we'll send them back to the login.
    return <Navigate to="/login" />;
  }

  // 3. If they are logged in and have the correct role, show the page
  return children;
};

export default ProtectedRoute;
