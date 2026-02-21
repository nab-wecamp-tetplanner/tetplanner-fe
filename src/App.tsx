import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceDashboard, Transaction, Dashboard } from "./pages";
import { Bounce, ToastContainer } from "react-toastify";

import "./App.css";
import Header from "./components/Header/Header";
import TaskManagement from "./pages/TaskManagement/TaskManagement";
import Overview from "./pages/Overview";
import CalendarPage from "./pages/Calendar/Calendar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Auth/LoginPage";
import Register from "./pages/Auth/RegisterPage";
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
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
          <Routes>
            {/* Public Route  */}
            <Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes  */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Overview />} />
              <Route path="/task" element={<TaskManagement />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
