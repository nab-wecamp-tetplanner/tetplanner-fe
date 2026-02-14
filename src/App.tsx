import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceDashboard, Transaction, Dashboard } from "./pages";

import "./App.css";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
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
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <h1 className="text-2xl text-gray-600">Page not found</h1>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
