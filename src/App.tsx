import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import Header from './components/Header/Header';
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <Header />
            <Routes>
              <Route path="/" element={<div>Trang Overview</div>} />
              <Route path="/task" element={<div>Trang Task Management</div>} />
              <Route path="/calendar" element={<div>Trang Calendar</div>} />
              <Route path="/finance" element={<div>Trang Finance</div>} />
              <Route path="/transaction" element={<div>Trang Transactions</div>} />
              <Route path="/dashboard" element={<div>Trang Dashboard</div>} />
            </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
};    