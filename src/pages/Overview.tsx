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
  const [data, setData] = useState<FullConfigData | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const configId = useAppStore((state) => state.configId);

  /**
   * Orchestrates parallel data fetching for all configurations,
   * including their respective budget summaries and task lists.
   */
  const fetchAllOverviewData = useCallback(async () => {
    try {
      showLoading();
      if (!configId) return;

      const [config, budgetSummary, taskItems] = await Promise.all([
        apiClient.tetConfigs.getConfigById(configId),
        apiClient.tetConfigs.getBudgetSummary(configId),
        apiClient.todos.getAll({ tetConfigId: configId }),
      ]);

      const fullData: FullConfigData = {
        id: config.id,
        name: config.name,
        year: config.year,
        created_at: config.created_at,
        deleted_at: config.deleted_at,
        owner: config.owner,

        total_budget: budgetSummary.total_budget,
        used_budget: budgetSummary.used_budget,
        remaining_budget: budgetSummary.remaining_budget,
        warning_level: budgetSummary.warning_level,

        tasks: taskItems,
      };
      console.log("Full data: ", fullData);
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

  const handleDeleteConfigAction = useCallback(
    async (configId: string) => {
      if (
        window.confirm("Are you sure you want to delete this configuration?")
      ) {
        try {
          await apiClient.tetConfigs.deleteConfig(configId);
          fetchAllOverviewData();
        } catch (error) {
          console.error("Delete failed:", error);
        }
      }
    },
    [fetchAllOverviewData],
  );

  const handleUpdateBudgetAction = useCallback(
    async (categoryId: string) => {
      const input = window.prompt("Enter new allocated budget (VND):");
      if (!input) return;

      const newAmount = Number(input);
      if (!isNaN(newAmount)) {
        try {
          await apiClient.categories.update(categoryId, {
            allocated_budget: newAmount,
          });
          fetchAllOverviewData();
        } catch (error) {
          console.error("Update failed:", error);
        }
      }
    },
    [fetchAllOverviewData],
  );

  return (
    <div className="mb-10 min-h-screen bg-[#F8FAFC] font-sans">
      <HeroSection />

      <div className="mt-8 mx-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Budgets & Transactions */}
          <div className="space-y-6 flex flex-col">
            <BudgetCard
              key={configId}
              id={configId ?? ""}
              onDelete={() => handleDeleteConfigAction(configId ?? "")}
              onUpdate={() => handleUpdateBudgetAction(configId ?? "")}
              icon={"🛍️"}
              title={data?.name || "Unnamed Configuration"}
              spent={data?.used_budget || 0}
              total={data?.total_budget || 0}
              progress={
                data?.total_budget
                  ? (data.used_budget / data.total_budget) * 100
                  : 0
              }
              color="bg-[#5B63D3]"
            />

            <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
              <TransactionsTableWidget />
            </div>
          </div>

          {/* Column 2: Tasks */}
          <div className="space-y-6">
            <TaskListWidget />
          </div>

          {/* Column 3: Calendar */}
          <div className="space-y-6">
            <CalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
