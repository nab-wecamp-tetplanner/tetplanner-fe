import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  if (isLoading) {
    return <div>Đang kiểm tra đăng nhập...</div>; 
  }

  // Isn't authenticated, navigate to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // OK, allow access to the protected route
  return <Outlet />;
};

export default ProtectedRoute;