import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export function ProtectedRoute({ children }) {
  const { token, user } = useAuthStore();
  const location = useLocation();
  if (!token || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function PermissionRoute({ permission, children }) {
  const { token, user, can } = useAuthStore();
  const location = useLocation();
  if (!token || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!can(permission)) return <Navigate to="/unauthorized" replace />;
  return children;
}
