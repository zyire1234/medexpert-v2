import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * <ProtectedRoute>
 * Wraps routes that require authentication (and optionally admin role).
 *
 * Props:
 *   adminOnly  — if true, only users with role "admin" may pass
 *   children   — the page component to render when access is granted
 *
 * Behaviour:
 *   • While the auth bootstrap check is still running, renders a spinner
 *     so the page doesn't flash the login redirect incorrectly.
 *   • Saves the attempted URL in location state so Login can redirect back.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader" aria-label="Checking session…">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
