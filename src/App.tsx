import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
          <Route path="*" element={<div>Hello World</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
};    