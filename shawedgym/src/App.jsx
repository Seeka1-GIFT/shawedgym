import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { authHelpers } from './services/api.js';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { GymProvider } from './contexts/GymContext.jsx';

// Import auth pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Import all pages.  Each page corresponds to a feature area of the
// application.  The dashboard summarises high-level metrics, while the
// remainder provide CRUD-style listings and forms.
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import Plans from './pages/Plans.jsx';
import Assets from './pages/Assets.jsx';
import Classes from './pages/Classes.jsx';
import Trainers from './pages/Trainers.jsx';
import Attendance from './pages/Attendance.jsx';
import Payments from './pages/Payments.jsx';
import Expenses from './pages/Expenses.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import CheckIn from './pages/CheckIn.jsx';

function App() {
  // Persist the user's theme choice in localStorage.  This state is
  // propagated to children via props so that they can toggle the theme.
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isAuthenticated = authHelpers.isAuthenticated();

  return (
    <ToastProvider>
      <GymProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex">
                {/* Sidebar navigation.  On small screens the sidebar can be toggled via
                    the hamburger menu within the Navbar component. */}
                <Navbar theme={theme} setTheme={setTheme} />
                {/* Main content area.  A min-h-screen ensures that the main area
                    stretches to full height.  Padding provides breathing room. */}
                <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/members" element={<Members />} />
                    <Route path="/plans" element={<Plans />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/classes" element={<Classes />} />
                    <Route path="/trainers" element={<Trainers />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings theme={theme} setTheme={setTheme} />} />
                    <Route path="/checkin" element={<CheckIn />} />
                    {/* Redirect unknown paths back to the dashboard. */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </GymProvider>
    </ToastProvider>
  );
}

export default App;
