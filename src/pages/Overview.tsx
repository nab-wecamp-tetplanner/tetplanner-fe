import BudgetCard from "../components/Overview/BudgetCard";
import TransactionsTableWidget from "../components/Overview/RecentTransaction";
import TaskListWidget from "../components/Overview/TaskWidget";
import UpcomingTasksWidget from "../components/Overview/UpcommingTasksWidget";
import CalendarWidget from "../components/Overview/CalendarWidget/CalendarWidget";
import type { TetConfig } from "../types/tetConfig.types";
import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import HeroSection from "../components/Overview/HeroSection";

export default function Overview() {
  const [configs, setConfigs] = useState<TetConfig[]>([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      const response = await apiClient.tetConfigs.getMyConfigs();
      setConfigs(response);
    };

    fetchConfigs();
  }, []);


  return (
    <div className="mb-10 min-h-screen bg-[#F8FAFC] font-sans">
      <HeroSection />

      <div className="mt-8 mx-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Buget Cards */}
          <div className="space-y-6 flex flex-col">
            {configs.length !== 0 && configs.map((config) => (
              <BudgetCard
                key={config.id}
                icon={"🛍️"}
                title={config.name}
                spent={10000}
                progress={50}
                total={config.total_budget}
                color="bg-[#5B63D3]"
              />
            ))}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
              <TransactionsTableWidget />
            </div>
          </div>

          {/* Col 2: Tasks */}
          <div className="space-y-6">
            <TaskListWidget tetConfigs={configs.map(c => c.id)} />
            <UpcomingTasksWidget />
          </div>

          {/* Col 3: Calendar and Progress Tracking */}
          <div className="space-y-6">
            <CalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
