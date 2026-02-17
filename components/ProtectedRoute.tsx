/**
 * VIZUAL-X PROTECTED ROUTE
 * Wrapper component for authentication-protected routes
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthUser } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'operator';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated && requiredRole) {
        const user = authService.getUser();
        // Check role-based access
        if (user) {
          // Admin has access to everything
          if (user.role === 'admin') {
            setHasPermission(true);
          } else if (user.role === requiredRole) {
            setHasPermission(true);
          } else {
            setHasPermission(false);
          }
        } else {
          setHasPermission(false);
        }
      } else if (authenticated) {
        // No specific role required, just authentication
        setHasPermission(true);
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [requiredRole]);

  if (isChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-absolute)]">
        <div className="text-center">
          <div className="inline-block">
            <svg className="animate-spin h-12 w-12 text-[#3B82F6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-4 text-[var(--text-muted)] font-bold uppercase tracking-wider text-sm">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission) {
    // User is authenticated but doesn't have required role
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-absolute)]">
        <div className="metallic-border-card p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black italic mb-2 text-[var(--text-primary)]">
            ACCESS DENIED
          </h2>
          <p className="text-[var(--text-muted)] mb-4">
            You don't have permission to access this resource.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="futuristic-btn px-6 py-2 text-sm font-bold uppercase tracking-widest"
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
