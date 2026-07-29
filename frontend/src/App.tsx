// src/App.tsx
import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Page Imports
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { UserManagement } from "./pages/UserManagement";
import { ActivityLogs } from "./pages/ActivityLogs";
import { Dashboard } from "./pages/Dashboard";
import { Memoranda } from "./pages/Memoranda";
import { DocumentLogging } from "./pages/DocumentLogging";
import { Settings } from "./pages/Settings";
import { NewsManager } from "./pages/NewsManager";
import { CalendarManager } from "./pages/CalendarManager";
import { OfficialsManager } from "./pages/OfficialsManager";
import { ClassroomMonitoring } from "./pages/ClassroomMonitoring";
import { TeachingLoads } from "./pages/TeachingLoads";
import { MasterScheduler } from "./pages/MasterScheduler";
import { AssessmentGenerator } from "./pages/AssessmentGenerator";

// --- RBAC Middleware Component ---
// This checks if a user is logged in AND if they have the correct role.
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const userString = localStorage.getItem("portalUser");

  if (!userString) {
    // If there is no user data in localStorage, kick them to the login screen
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  if (!allowedRoles.includes(user.role)) {
    // If they are logged in but don't have the right role, show unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything checks out, render the requested page
  return <>{children}</>;
};

// --- Main App Component ---
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Admin Routes (Superuser & Admin only) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Superuser", "Admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Protected General Dashboard (For all valid logged-in users) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Superuser", "Admin", "Staff", "Student"]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/memoranda"
          element={
            <ProtectedRoute
              allowedRoles={["Superuser", "Admin", "Staff", "Student"]}
            >
              <Memoranda />
            </ProtectedRoute>
          }
        />

        <Route path="/document-tracking" element={<DocumentLogging />} />
        <Route path="/settings" element={<Settings />} />

        {/* Fallback for blocked access */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="p-8 text-[#9B1C1C] font-bold border border-red-200 bg-red-50 uppercase tracking-widest">
                Access Denied. You do not have permission to view this page.
              </div>
            </div>
          }
        />

        <Route path="/logs" element={<ActivityLogs />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/news-manager" element={<NewsManager />} />
        <Route path="/calendar-manager" element={<CalendarManager />} />
        <Route path="/officials-manager" element={<OfficialsManager />} />
        <Route path="/classroom-monitoring" element={<ClassroomMonitoring />} />
        <Route path="/teaching-loads" element={<TeachingLoads />} />
        <Route path="/master-scheduler" element={<MasterScheduler />} />

        <Route
          path="/assessment"
          element={
            <ProtectedRoute allowedRoles={["Superuser", "Admin", "Staff"]}>
              <AssessmentGenerator />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
