import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceDashboard, Transaction, Dashboard } from "./pages";
import { Bounce, ToastContainer } from "react-toastify";

import "./App.css";
import Header from "./components/Header/Header";
import TaskManagement from "./pages/TaskManagement/TaskManagement";
import Overview from "./pages/Overview";
// import Profile from "./pages/Profile";
import Profile from "./pages/Settings";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Auth/LoginPage";
import Register from "./pages/Auth/RegisterPage";
import VerifyOTP from "./pages/Auth/VerifyOTP";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import ConfigGuard from "./routes/ConfigGuard";
import ChatWidget from "./components/ChatWidget/ChatWidget";
import PlanningOverview from "./pages/TimelineView/PlanningOverview";
import ConfigSelector from "./components/ConfigSelector/ConfigSelector";
import { useAuthContext } from "./contexts/AuthTypes";
import { useAppStore } from "./stores/useAppStore";

const queryClient = new QueryClient();

/* App.tsx */

// 1. Tạo một component "ruột" ở đây
const AppContent = () => {
  const { configId } = useAppStore();
  const { isAuthenticated } = useAuthContext(); // Bây giờ dùng ở đây là CHUẨN!

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Header />

      {/* {isAuthenticated && !configId && <ConfigSelector />}  */}

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/forgot-password"
          element={<div>Forgot Password Page</div>}
        />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/" element={<Overview />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/config-selector" element={<ConfigSelector />} />
          <Route element={<ConfigGuard />}>
            <Route path="/task" element={<TaskManagement />} />
            <Route path="/calendar" element={<PlanningOverview />} />
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
      <ChatWidget />
    </>
  );
};

// 2. Component App chính chỉ đóng vai trò "bao bọc" các Provider
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <LoadingProvider>
            <BrowserRouter>
              <AuthProvider>
                <AppContent /> {/* Gọi cái ruột ở đây */}
              </AuthProvider>
            </BrowserRouter>
          </LoadingProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
