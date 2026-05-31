import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser, getToken } from '../api/client.js';
import { homePathForRole, rolesForPath } from './roleConfig.js';

/**
 * Guard route berdasarkan role.
 * Jika role tidak diizinkan → redirect ke dashboard milik role tersebut (bukan selalu /owner).
 */
export default function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  const allowedRoles = roles ?? rolesForPath(location.pathname);

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const home = homePathForRole(user.role);
    return <Navigate to={home} replace />;
  }

  return children;
}
