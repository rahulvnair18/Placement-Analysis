import React from "react";
import { Routes, Route } from "react-router-dom";

// Your existing page components
import LoginPage from "./features/auth/LoginPage";
import Register from "./features/auth/Register";
import HodDashboard from "./features/pages/dashboard/hod/HodDashboard";
import StudentDashboard from "./features/pages/dashboard/student/StudentDashboard";
import AdminDashboard from "./features/pages/dashboard/admin/AdminDashboard";
import Instruction from "./features/pages/dashboard/Test/instruction";

// --- NEW ---
// Import the Test Engine component you just created
import Engine from "./features/pages/dashboard/Test/Engine";
import TestCompleted from "./features/pages/dashboard/Test/TestCompleted";
import ResultAnalysis from "./features/pages/dashboard/student/ResultAnalysis";
import LatestAnalysisView from "./features/pages/dashboard/student/LatestAnalysisView";
import AnalysisDashboard from "./features/pages/dashboard/student/AnalysisDashboard";
// Import the "security guard" component
import ProtectedRoute from "./components/ProtectedRoute";
import ClassroomDetails from "./features/pages/dashboard/hod/ClassroomDetails";

const App = () => {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />

      {/* --- Student Protected Routes --- */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute role="Student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/instruction"
        element={
          <ProtectedRoute role="Student">
            <Instruction />
          </ProtectedRoute>
        }
      />

      {/* --- NEW TEST ENGINE ROUTE --- */}
      {/* This route is now active and protected. */}
      <Route
        path="/test/engine"
        element={
          <ProtectedRoute role="Student">
            <Engine />
          </ProtectedRoute>
        }
      />

      {/* --- HOD Protected Routes --- */}
      <Route
        path="/hod-dashboard"
        element={
          <ProtectedRoute role="HOD">
            <HodDashboard />
          </ProtectedRoute>
        }
      />

      {/* --- Admin Protected Routes --- */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute role="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/completed/:resultId"
        element={
          <ProtectedRoute role="Student">
            <TestCompleted />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:resultId"
        element={
          <ProtectedRoute role="Student">
            <ResultAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/latest"
        element={
          <ProtectedRoute role="Student">
            <LatestAnalysisView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/classroom/:classroomId"
        element={
          <ProtectedRoute role="HOD">
            <ClassroomDetails />
          </ProtectedRoute>
        }
      />

      {/* A catch-all route for any page that doesn't exist */}
      <Route path="*" element={<h1>404: Page Not Found</h1>} />
    </Routes>
  );
};

export default App;
