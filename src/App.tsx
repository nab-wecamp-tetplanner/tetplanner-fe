import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import Header from './components/Header/Header';
import TaskManagement from './pages/TaskManagement/TaskManagement';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<div style={{ padding: '40px', color: 'var(--text)' }}>Overview</div>} />
            <Route path="/task" element={<TaskManagement />} />
            <Route path="/calendar" element={<div style={{ padding: '40px', color: 'var(--text)' }}>Calendar</div>} />
            <Route path="/finance" element={<div style={{ padding: '40px', color: 'var(--text)' }}>Finance</div>} />
            <Route path="/transaction" element={<div style={{ padding: '40px', color: 'var(--text)' }}>Transactions</div>} />
            <Route path="/dashboard" element={<div style={{ padding: '40px', color: 'var(--text)' }}>Dashboard</div>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
};    