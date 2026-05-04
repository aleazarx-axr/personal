// src/App.tsx
import React from 'react';


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page Imports
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { ActivityLogs } from './pages/ActivityLogs';
import { Dashboard } from './pages/Dashboard';
import { Memoranda } from './pages/Memoranda';
import { DocumentLogging } from './pages/DocumentLogging';

// --- RBAC Middleware Component ---
// This checks if a user is logged in AND if they have the correct role.
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const userString = localStorage.getItem('portalUser');
  
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
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Admin Routes (Superuser & Admin only) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['Superuser', 'Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected General Dashboard (For all valid logged-in users) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Superuser', 'Admin', 'Staff', 'Student']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/memoranda" 
          element={
            <ProtectedRoute allowedRoles={['Superuser', 'Admin', 'Staff', 'Student']}>
              <Memoranda />
            </ProtectedRoute>
          } 
        />

        <Route path="/document-tracking" element={<DocumentLogging />} />

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
      </Routes>
    </Router>
  );
}

export default App;