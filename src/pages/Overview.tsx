import { useEffect, useState, useCallback } from "react";
import apiClient from "../services/apiClient";

// Components
import BudgetCard from "../components/Overview/BudgetCard";
import TransactionsTableWidget from "../components/Overview/RecentTransaction";
import TaskListWidget from "../components/Overview/TaskWidget";
import CalendarWidget from "../components/Overview/CalendarWidget/CalendarWidget";
import HeroSection from "../components/Overview/HeroSection";
import {
  ListChecks,
  Wallet,
  BarChart3,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react";

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

const features = [
  {
    icon: ListChecks,
    title: "Shopping List",
    description:
      "Create and manage your Tet shopping list easily and in an organized manner.",
    color: "bg-planner-blue",
    lightBg: "bg-planner-blue-light",
    textColor: "text-planner-blue",
    borderColor: "border-planner-blue/20",
  },
  {
    icon: Wallet,
    title: "Budget Management",
    description: "Track spending in real-time and never exceed your budget.",
    color: "bg-planner-green",
    lightBg: "bg-planner-green-light",
    textColor: "text-planner-green",
    borderColor: "border-planner-green/20",
  },
  {
    icon: BarChart3,
    title: "Spending Analysis",
    description: "View detailed reports by category and track spending trends.",
    color: "bg-planner-purple",
    lightBg: "bg-planner-purple-light",
    textColor: "text-planner-purple",
    borderColor: "border-planner-purple/20",
  },
  {
    icon: Calendar,
    title: "Shopping Schedule",
    description:
      "Set deadlines for each item and never miss a thing before Tet.",
    color: "bg-planner-amber",
    lightBg: "bg-planner-amber-light",
    textColor: "text-planner-amber",
    borderColor: "border-planner-amber/20",
  },
];

export default function Overview() {
  const [data, setData] = useState<FullConfigData | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const configId = useAppStore((state) => state.configId);

  const fetchAllOverviewData = useCallback(async () => {
    try {
      if (!configId) return;

      const [config, budgetSummary, taskItems] = await Promise.all([
        apiClient.tetConfigs.getConfigById(configId),
        apiClient.tetConfigs.getBudgetSummary(configId),
        apiClient.todos.getAll({ tetConfigId: configId }),
      ]);

      const fullData: FullConfigData = {
        ...config,
        total_budget: budgetSummary.total_budget,
        used_budget: budgetSummary.used_budget,
        remaining_budget: budgetSummary.remaining_budget,
        warning_level: budgetSummary.warning_level,
        tasks: taskItems,
      };
      setData(fullData);
    } catch (error) {
      console.error("Failed to synchronize Overview data:", error);
    } finally {
      hideLoading();
    }
  }, [configId]);

  useEffect(() => {
    fetchAllOverviewData();
  }, [configId, fetchAllOverviewData]);

  const handleDeleteConfigAction = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this plan?")) {
        try {
          await apiClient.tetConfigs.deleteConfig(id);
          fetchAllOverviewData();
        } catch (error) {
          console.error(error);
        }
      }
    },
    [fetchAllOverviewData],
  );

  const handleUpdateBudgetAction = useCallback(
    async (catId: string) => {
      const input = window.prompt("Enter new allocated budget (VND):");
      if (input && !isNaN(Number(input))) {
        try {
          await apiClient.categories.update(catId, {
            allocated_budget: Number(input),
          });
          fetchAllOverviewData();
        } catch (error) {
          console.error(error);
        }
      }
    },
    [fetchAllOverviewData],
  );

  return (
    <div className="mb-10 min-h-screen bg-[#F8FAFC] font-sans">
      <HeroSection />

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-planner-purple-light text-planner-purple text-xs font-semibold mb-3 border border-planner-purple/20">
            <Star className="w-3.5 h-3.5" />
            Features
          </div>
          <h2 className="font-serif text-3xl text-foreground mb-3">
            Everything you need
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto italic">
            The perfect tool to plan your Tet shopping scientifically and
            economically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-[2.5rem] border p-8 hover:shadow-xl transition-all duration-300 ${feature.lightBg} ${feature.borderColor}`}
            >
              <div
                className={`h-10 w-10 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}
              >
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`font-serif text-xl mb-3 ${feature.textColor}`}>
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Header - Đã sửa lỗi khoảng cách sát nhãn */}
      <div className="text-center pt-12 mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-planner-green-light text-planner-green text-[10px] font-black uppercase tracking-widest border border-planner-green/20 mb-3">
          <TrendingUp className="w-3.5 h-3.5" />
          Live Dashboard
        </div>
        <h2 className="font-serif text-3xl text-foreground mb-3">
          Your Plan Insight
        </h2>
      </div>

      {/* Dashboard Widgets */}
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
              title={data?.name || "Unnamed Plan"}
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
