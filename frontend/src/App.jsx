import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import LoginCard from "./components/LoginCard";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import StudentPage from "./pages/StudentPage";
import RoomPage from "./pages/RoomPage";
import AssignmentPage from "./pages/AssignmentPage";
import Profile from "./pages/Profile";

// Hide the navbar on the Login / Register page
function AppNavbar() {
  const location = useLocation();

  if (location.pathname === "/") {
    return null;
  }

  return <Navbar title="Dormitory Management System" />;
}

function App() {
  return (
    <div>
      <AppNavbar />

      <Routes>
        {/* Login / Register */}
        <Route path="/" element={<LoginCard />} />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Management */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <StudentPage />
            </ProtectedRoute>
          }
        />

        {/* Room Management */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <RoomPage />
            </ProtectedRoute>
          }
        />

        {/* Room Assignments */}
        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AssignmentPage />
            </ProtectedRoute>
          }
        />

        {/* Student Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized Access */}
        <Route
          path="/unauthorized"
          element={
            <div style={{ padding: "30px" }}>
              <h2>403 - Access Denied</h2>
              <p>You do not have permission to access this page.</p>
            </div>
          }
        />

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;