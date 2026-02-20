import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceDashboard, Transaction, Dashboard } from "./pages";

import "./App.css";

import './App.css'
import Header from './components/Header/Header';
import TaskManagement from './pages/TaskManagement/TaskManagement';
import Overview from './pages/Overview';
import CalendarPage from './pages/Calendar/Calendar';
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <Header />
            <Routes>
              <Route path="/" element={<div>Trang Overview</div>} />
              <Route path="/task" element={<TaskManagement />} />
              <Route path="/calendar" element={<div>Trang Calendar</div>} />
              <Route path="/finance" element={<div>Trang Finance</div>} />
              <Route path="/transaction" element={<div>Trang Transactions</div>} />
              <Route path="/dashboard" element={<div>Trang Dashboard</div>} />
            </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
