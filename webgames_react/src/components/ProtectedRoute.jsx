
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function ProtectedRoute({ children, role }) {
  const { isLoggedIn, member, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (role === 'member' && member?.role !== 'member') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;
