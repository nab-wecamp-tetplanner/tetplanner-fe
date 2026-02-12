import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceDashboard, Transaction, Dashboard } from "./pages";

import "./App.css";

import './App.css'
import Overview from './pages/Overview';
import CalendarPage from './pages/Calendar/Calendar';
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/" element={<Overview />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-gray-900">
                  Welcome to NY Planner
                </h1>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
