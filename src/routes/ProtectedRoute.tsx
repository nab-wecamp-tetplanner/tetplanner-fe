import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthTypes";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    // Thay vì div trống, hãy dùng một Spinner để user biết app đang chạy
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại vị trí cũ để sau khi login xong quay lại đúng trang đó
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
