<<<<<<< HEAD
// src/App.jsx
import React, { useEffect } from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { Toaster } from 'sonner';
=======
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

// Layouts
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import PortfolioBuilderPage from './pages/PortfolioBuilderPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';
import UserManagement from './components/admin/UserManagement';
>>>>>>> 804ddfb (changes)

// STORES
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

// SOCKET
import socketService from './services/socketService';

// REALTIME COMPONENTS
import NotificationCenter from './components/realtime/NotificationCenter';

// LAYOUTS
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// ADMIN COMPONENTS
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import ResumeManagement from './components/admin/ResumeManagement';
import SystemAnalytics from './components/admin/SystemAnalytics';
import SystemSettings from './components/admin/SystemSettings';
import AdminRoute from './components/admin/AdminRoute';

// PAGES
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import PortfolioBuilderPage from './pages/PortfolioBuilderPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
<<<<<<< HEAD

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
=======
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { initializeTheme } = useThemeStore();
  const { checkAuth } = useAuthStore();
>>>>>>> 804ddfb (changes)

  const { initializeTheme } = useThemeStore();

  const {
    checkAuth,
    isAuthenticated
  } = useAuthStore();

  // INITIALIZE APP
  useEffect(() => {
    initializeTheme();
<<<<<<< HEAD

    checkAuth();
  }, []);

  // SOCKET CONNECTION
  useEffect(() => {

    if (isAuthenticated) {
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };

  }, [isAuthenticated]);
=======
    checkAuth();
  }, []);
>>>>>>> 804ddfb (changes)

  return (
    <Router>

      {/* TOASTER */}
      <Toaster
        position="top-right"
        richColors
        closeButton
      />

      {/* NOTIFICATIONS */}
      <NotificationCenter />

      <Routes>

        {/* ========================= */}
        {/* PUBLIC ROUTES */}
        {/* ========================= */}

        <Route element={<RootLayout />}>

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

        </Route>

<<<<<<< HEAD
        {/* ========================= */}
        {/* AUTH ROUTES */}
        {/* ========================= */}

        <Route element={<AuthLayout />}>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-builder"
            element={
              <ProtectedRoute>
                <ResumeBuilderPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-builder/:id"
            element={
              <ProtectedRoute>
                <ResumeBuilderPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/portfolio-builder"
            element={
              <ProtectedRoute>
                <PortfolioBuilderPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* ========================= */}
        {/* ADMIN ROUTES */}
        {/* ========================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >

          {/* ADMIN DASHBOARD */}
          <Route
            index
            element={<AdminDashboard />}
          />

          {/* USER MANAGEMENT */}
          <Route
            path="users"
            element={<UserManagement />}
          />

          {/* RESUME MANAGEMENT */}
          <Route
            path="resumes"
            element={<ResumeManagement />}
          />

          {/* SYSTEM ANALYTICS */}
          <Route
            path="analytics"
            element={<SystemAnalytics />}
          />

          {/* SYSTEM SETTINGS */}
          <Route
            path="settings"
            element={<SystemSettings />}
          />

        </Route>

        {/* ========================= */}
        {/* 404 */}
        {/* ========================= */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />

=======
        {/* Protected Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/resume-builder" element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/resume-builder/:id" element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/portfolio-builder" element={
            <ProtectedRoute>
              <PortfolioBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/portfolio-builder/:id" element={
            <ProtectedRoute>
              <PortfolioBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="resumes" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminDashboard />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
>>>>>>> 804ddfb (changes)
      </Routes>
    </Router>
  );
}

export default App;