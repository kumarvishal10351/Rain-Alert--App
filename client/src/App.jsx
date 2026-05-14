import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WeatherProvider } from './context/WeatherContext';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Skeleton } from './components/common/Skeleton';
import PropTypes from 'prop-types';

// Eager-loaded pages (critical path)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Lazy-loaded pages (code splitting)
const Settings = lazy(() => import('./pages/Settings'));
const AlertHistory = lazy(() => import('./pages/AlertHistory'));

/**
 * Protected Route wrapper
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#0a0a1a]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full gradient-primary animate-pulse-slow" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Public Route wrapper
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#0a0a1a]">
        <div className="w-16 h-16 rounded-full gradient-primary animate-pulse-slow" />
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Page loading fallback
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center dark:bg-[#0a0a1a]">
    <div className="space-y-4 w-full max-w-md p-8">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AuthProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute><Register /></PublicRoute>
                  } />

                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <WeatherProvider>
                        <Dashboard />
                      </WeatherProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <WeatherProvider>
                        <Settings />
                      </WeatherProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/alerts" element={
                    <ProtectedRoute>
                      <WeatherProvider>
                        <AlertHistory />
                      </WeatherProvider>
                    </ProtectedRoute>
                  } />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
