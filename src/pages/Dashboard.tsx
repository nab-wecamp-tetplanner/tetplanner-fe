import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import type { TetConfig } from "../types/tetConfig.types";

// Components
import CalendarSection from "../components/Dashboard/CalendarSection";
import { TaskQuickStats } from "../components/Dashboard/TaskQuickStats";
import { TaskDoneChart } from "../components/Dashboard/TaskDoneChart";
import { ExpensePieChart } from "../components/Dashboard/ExpensePieChart";
import { IncomeExpenseLineChart } from "../components/Dashboard/IncomeExpenseLineChart";
import { BudgetCardsSection } from "../components/Dashboard/BudgetCardsSection";
import TaskListWidget from "../components/Overview/TaskWidget";

// Decoratives
import FallingPetals from "../components/FallingPetals/FallingPetals";
import {
  Lantern,
  BlossomBranch,
  CloudMotif,
  TraditionalCake,
} from "../components/Decoratives/Decoratives";

const BACKGROUND_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d6cfc4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export default function Dashboard() {
  const [, setConfigs] = useState<TetConfig[]>([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      const response = await apiClient.tetConfigs.getMyConfigs();
      setConfigs(response);
    };

    fetchConfigs();
  }, []);

  // const tetConfigIds = configs.map((config) => config.id);

  return (
    <div className="relative min-h-screen bg-(--bg) text-(--text) transition-colors duration-500 overflow-hidden font-sans">
      
      {/* 1. Background Pattern & Warm Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 tet-deco-element transition-opacity duration-500"
        style={{ backgroundImage: BACKGROUND_PATTERN, opacity: 'var(--pattern-opacity)' }}
      ></div>
      <div
        className="absolute inset-0 pointer-events-none z-0 tet-deco-element transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 20% 0%, var(--gradient-bg-1) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, var(--gradient-bg-2) 0%, transparent 50%)`,
        }}
      ></div>

      {/* 2. Decorative Elements lơ lửng phía sau */}
      <div className="tet-deco-element"><FallingPetals count={15} /></div>
      <Lantern className="absolute top-10 right-20 animate-[swing_4s_ease-in-out_infinite] z-0 opacity-80 tet-deco-element" size="md" />
      <Lantern className="absolute top-24 left-16 animate-[swing_3s_ease-in-out_infinite_reverse] z-0 opacity-70 tet-deco-element" size="sm" />
      <BlossomBranch className="absolute top-16 -left-10 animate-[float_6s_ease-in-out_infinite] z-0 opacity-80 tet-deco-element transform scale-90" variant="apricot" />
      <BlossomBranch className="absolute top-32 -right-8 animate-[float_5s_ease-in-out_infinite_reverse] z-0 transform scale-x-[-1] scale-90 opacity-80 tet-deco-element" variant="peach" />
      <CloudMotif className="absolute top-20 left-[30%] animate-[float_7s_ease-in-out_infinite] z-0 opacity-50 tet-deco-element" />
      <TraditionalCake className="absolute bottom-12 right-12 z-0 opacity-40 animate-[float_4s_ease-in-out_infinite] tet-deco-element" variant="chung" />

      {/* 3. MAIN CONTENT - Đặt relative và z-10 để giữ nguyên màu trắng nổi lên trên nền */}
      <main className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-col">
        {/* Top Section: Calendar and Quick Stats */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-0 justify-between">
          <CalendarSection />
          <div className="flex flex-col gap-4 w-full md:max-w-[50%]">
            <TaskQuickStats />
            <div className="flex gap-4">
              <TaskListWidget />
              <BudgetCardsSection />
            </div>
          </div>
        </div>

        {/* Bottom Section: Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ExpensePieChart />
          <IncomeExpenseLineChart />
          <TaskDoneChart />
        </div>
      </main>
    </div>
  );
}