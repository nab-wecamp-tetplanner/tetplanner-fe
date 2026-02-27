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

export default function Dashboard() {
  const [configs, setConfigs] = useState<TetConfig[]>([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      const response = await apiClient.tetConfigs.getMyConfigs();
      setConfigs(response);
    };

    fetchConfigs();
  }, []);

  const tetConfigIds = configs.map((config) => config.id);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-col">
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
