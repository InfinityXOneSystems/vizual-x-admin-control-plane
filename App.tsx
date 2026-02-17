/**
 * VIZUAL-X MAIN APP
 * Root component with routing and authentication
 */

import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import AppDashboard from './AppDashboard';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Check if authentication is enabled via feature flag
  const authEnabled = import.meta.env.VITE_ENABLE_AUTH !== 'false';

  const handleLoginSuccess = () => {
    // Get the intended destination from location state, or default to home
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  // If auth is disabled, render dashboard directly
  if (!authEnabled) {
    return <AppDashboard />;
  }

  return (
    <Routes>
      {/* Public route: Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )
        } 
      />

      {/* Protected route: Main dashboard and all pages */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <AppDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default App;
