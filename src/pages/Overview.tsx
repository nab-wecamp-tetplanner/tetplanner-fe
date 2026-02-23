import { useEffect, useState, useCallback } from "react";
import apiClient from "../services/apiClient";

// Components
import BudgetCard from "../components/Overview/BudgetCard";
import TransactionsTableWidget from "../components/Overview/RecentTransaction";
import TaskListWidget from "../components/Overview/TaskWidget";
import CalendarWidget from "../components/Overview/CalendarWidget/CalendarWidget";
import HeroSection from "../components/Overview/HeroSection";

// Types
import type { TetConfig } from "../types/tetConfig.types";
import type { TodoItem } from "../types/todo.types";
import { useLoading } from "../contexts/LoadingContext";
import { useAppStore } from "../stores/useAppStore";

export interface FullConfigData extends TetConfig {
  total_budget: number;
  used_budget: number;
  remaining_budget: number;
  warning_level: string;
  tasks: TodoItem[];
}

export default function Overview() {
  const [data, setData] = useState<FullConfigData[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const configId = useAppStore((state) => state.configId);

  /**
   * Orchestrates parallel data fetching for all configurations, 
   * including their respective budget summaries and task lists.
   */
  const fetchAllOverviewData = useCallback(async () => {
    try {
      showLoading();
      
      const myConfigs: TetConfig[] = await apiClient.tetConfigs.getMyConfigs();

      const fullData = await Promise.all(
        myConfigs.map(async (config) => {
          // Fetch budget and tasks concurrently for each config ID
          const [budgetSummary, taskItems] = await Promise.all([
            apiClient.tetConfigs.getBudgetSummary(configId || config.id),
            apiClient.todos.getAll({ tetConfigId: configId || config.id }),
          ]);

          return {
            ...config,
            ...budgetSummary,
            tasks: taskItems,
          } as FullConfigData;
        })
      );

      setData(fullData);
    } catch (error) {
      console.error("Failed to synchronize Overview data:", error);
    } finally {
      hideLoading();
    }
  }, [configId]);

  useEffect(() => {
    fetchAllOverviewData();
  }, [configId]);

  const handleDeleteConfigAction = useCallback(async (configId: string) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        await apiClient.tetConfigs.deleteConfig(configId);
        fetchAllOverviewData();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  }, [fetchAllOverviewData]);

  const handleUpdateBudgetAction = useCallback(async (categoryId: string) => {
    const input = window.prompt("Enter new allocated budget (VND):");
    if (!input) return;
    
    const newAmount = Number(input);
    if (!isNaN(newAmount)) {
      try {
        await apiClient.categories.update(categoryId, { allocated_budget: newAmount });
        fetchAllOverviewData();
      } catch (error) {
        console.error("Update failed:", error);
      }
    }
  }, [fetchAllOverviewData]);

  const configIds = data.map((c) => c.id);

  return (
    <div className="mb-10 min-h-screen bg-[#F8FAFC] font-sans">
      <HeroSection />

      <div className="mt-8 mx-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Budgets & Transactions */}
          <div className="space-y-6 flex flex-col">
            {data.map((config) => (
              <BudgetCard
                key={config.id}
                id={config.id}
                onDelete={() => handleDeleteConfigAction(config.id)}
                onUpdate={() => handleUpdateBudgetAction(config.id)}
                icon={"🛍️"}
                title={config.name}
                spent={config.used_budget}
                total={config.total_budget}
                progress={config.total_budget > 0 ? (config.used_budget / config.total_budget) * 100 : 0}
                color="bg-[#5B63D3]"
              />
            ))}

            <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
              <TransactionsTableWidget tetConfigs={configIds} />
            </div>
          </div>

          {/* Column 2: Tasks */}
          <div className="space-y-6">
            <TaskListWidget tetConfigs={configIds} />
          </div>

          {/* Column 3: Calendar */}
          <div className="space-y-6">
            <CalendarWidget tasks={data} />
          </div>

        </div>
      </div>
    </div>
  );
}
