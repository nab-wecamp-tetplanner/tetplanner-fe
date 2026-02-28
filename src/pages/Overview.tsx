import { useEffect, useState, useCallback } from "react";
import apiClient from "../services/apiClient";
import { toast } from "react-toastify";

// Components
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
  Edit3,
  Trash2,
} from "lucide-react";

// Modal & Decoratives
import { ConfigModal } from "../components/ConfigModal";
import FallingPetals from "../components/FallingPetals/FallingPetals";
import {
  Lantern,
  BlossomBranch,
  CloudMotif,
  TraditionalCake,
} from "../components/Decoratives/Decoratives";

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
    title: "Task management",
    link: "/task",
    description: "Create and manage your Tet shopping list easily and in an organized manner.",
    color: "bg-(--primary)",
  },
  {
    icon: Wallet,
    title: "Budget Management",
    link: "/finance",
    description: "Track spending in real-time and never exceed your budget.",
    color: "bg-(--success)",
  },
  {
    icon: BarChart3,
    title: "Spending Analysis",
    link: "/dashboard",
    description: "View detailed reports by category and track spending trends.",
    color: "bg-(--secondary)",
  },
  {
    icon: Calendar,
    title: "Schedule",
    link: "/calendar",
    description: "Set deadlines for each item and never miss a thing before Tet.",
    color: "bg-(--primary-dark)",
  },
];

const BACKGROUND_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d6cfc4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export default function Overview() {
  const [data, setData] = useState<FullConfigData | null>(null);
  
  // STATES CHO MODAL EDIT
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const configId = useAppStore((state) => state.configId);
  const clearConfig = useAppStore((state) => state.clearConfig);

  const fetchAllOverviewData = useCallback(async () => {
    try {
      if (!configId) return;
      // showLoading();
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
  }, [configId, showLoading, hideLoading]);

  useEffect(() => {
    fetchAllOverviewData();
  }, [configId, fetchAllOverviewData]);

  // Xóa Config
  const handleDeleteConfigAction = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this plan?")) {
        try {
          if (!configId) return;
          // showLoading();
          await apiClient.tetConfigs.deleteConfig(id);
          clearConfig();
          toast.success("Config deleted successfully");
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete config");
        } finally {
          hideLoading();
        }
      }
    },
    [configId]
  );

  // Update Config (Submit từ Modal)
  const handleEditSubmit = async (updatedData: { name: string; year: number; total_budget: number }) => {
    if (!configId) return;
    try {
      setIsUpdating(true);
      await apiClient.tetConfigs.updateConfig(configId, updatedData);
      toast.success("Workspace updated successfully!");
      setIsEditModalOpen(false);
      fetchAllOverviewData(); // Tải lại data sau khi update
    } catch (error) {
      console.error(error);
      toast.error("Failed to update workspace.");
    } finally {
      setIsUpdating(false);
    }
  };

  // const handleUpdateBudgetAction = useCallback(
  //   async (catId: string) => {
  //     const input = window.prompt("Enter new allocated budget (VND):");
  //     if (input && !isNaN(Number(input))) {
  //       try {
  //         await apiClient.categories.update(catId, {
  //           allocated_budget: Number(input),
  //         });
  //         fetchAllOverviewData();
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     }
  //   },
  //   [fetchAllOverviewData],
  // );

  const SAFE_PERCENTAGE: number = 80;
  // Tính phần trăm sử dụng an toàn (tránh lỗi chia cho 0)
  const usedPercent = data && data.total_budget > 0 
      ? (data.used_budget / data.total_budget) * 100 
      : 0;
  const isWarning = usedPercent >= SAFE_PERCENTAGE;

  return (
    <div className="relative pb-10 min-h-screen bg-(--bg) text-(--text) font-sans transition-colors duration-500 overflow-hidden">
      
      {/* Background Pattern & Warm Overlay */}
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

      {/* Decorative Elements - Định vị absolute kèm Animations */}
      <div className="tet-deco-element"><FallingPetals count={20} /></div>
      <Lantern className="absolute top-12 left-12 animate-[swing_3s_ease-in-out_infinite] z-0 opacity-80 tet-deco-element" size="lg" />
      <Lantern className="absolute top-24 right-16 animate-[swing_4s_ease-in-out_infinite_reverse] z-0 opacity-80 tet-deco-element" size="md" />
      <BlossomBranch className="absolute top-16 -left-6 animate-[float_5s_ease-in-out_infinite] z-0 tet-deco-element" variant="apricot" />
      <BlossomBranch className="absolute top-8 -right-4 animate-[float_6s_ease-in-out_infinite_reverse] z-0 transform scale-x-[-1] tet-deco-element" variant="peach" />
      <CloudMotif className="absolute top-40 left-[15%] animate-[float_7s_ease-in-out_infinite] z-0 opacity-60 tet-deco-element" />
      <CloudMotif className="absolute top-32 right-[20%] animate-[float_8s_ease-in-out_infinite_reverse] z-0 opacity-60 tet-deco-element" />
      <TraditionalCake className="absolute bottom-10 left-10 z-0 opacity-40 animate-[float_4s_ease-in-out_infinite] tet-deco-element" variant="chung" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <HeroSection />

        {/* Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--gradient-bg-1) text-(--primary) text-xs font-semibold mb-3 border border-(--border)">
              <Star className="w-3.5 h-3.5 animate-[slowSpin_4s_linear_infinite]" />
              Features
            </div>
            <h2 className="font-serif text-3xl text-(--text-heading) mb-3 transition-colors">
              Everything you need
            </h2>
            <p className="text-(--text-muted) max-w-md mx-auto italic transition-colors">
              The perfect tool to plan your Tet tasks & shopping scientifically
              and economically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in relative z-10">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-[2.5rem] bg-(--bg-card) backdrop-blur-sm border border-(--border) p-8 hover:shadow-[0_8px_30px_var(--shadow-accent) hover:border-(--border-hover) transition-all duration-300 animate-[fadeInUp_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
              >
                <div
                  className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-(--text-heading)">
                  {feature.title}
                </h3>
                <p className="text-sm opacity-80 leading-relaxed text-(--text-muted)">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Header */}
        <div className="text-center pt-12 mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--gradient-bg-2) text-(--secondary) text-[10px] font-black uppercase tracking-widest border border-(--border) mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Dashboard
          </div>
          <h2 className="font-serif text-3xl text-(--text-heading) mb-3 transition-colors">
            Your Plan Insight
          </h2>
        </div>

        {/* Dashboard Widgets */}
        {configId && (
          <div className="mt-4 mx-4 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
              
              {/* Column 1: Budgets & Transactions */}
              <div className="space-y-6 flex flex-col">
                <div className="p-5 bg-(--bg-card) backdrop-blur-md rounded-2xl shadow-sm border border-(--border) group transition-all duration-300 hover:shadow-[0_4px_20px_var(--shadow-accent) hover:border-(--border-hover)">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-(--bg) border border-(--border) rounded-2xl text-lg shadow-inner group-hover:scale-105 transition-transform">
                        🧧
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-(--text-heading) transition-colors">
                          {data?.name || "My Tet Plan"}
                        </h3>
                        <div
                          className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isWarning
                              ? "text-(--danger) bg-red-50/50 border-(--danger)"
                              : "text-(--success) bg-green-50/50 border-(--success)"
                          }`}
                        >
                          {isWarning ? "Warning" : "Safe"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row gap-1">
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2 text-(--text-subtle) hover:text-(--primary) hover:bg-(--bg-glass) rounded-lg transition-all"
                        title="Edit Workspace"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfigAction(configId)}
                        className="p-2 text-(--text-subtle) hover:text-(--danger) hover:bg-(--bg-glass) rounded-lg transition-all"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-5">
                    <div className="flex justify-between items-end">
                      <p className="text-[13px] font-bold text-(--text) transition-colors">
                        Spent Budget
                      </p>
                      <p className="text-[12px] font-medium text-(--text-muted) transition-colors">
                        {data?.used_budget?.toLocaleString('vi-VN')} /{" "}
                        <span className="text-(--text-heading) font-bold">
                          {data?.total_budget?.toLocaleString('vi-VN') || 0}
                        </span>
                      </p>
                    </div>
                    <div className="w-full h-2.5 bg-(--bg) rounded-full overflow-hidden border border-(--border) shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          background: "var(--gradient-warm)",
                          width: `${Math.min(usedPercent, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-(--bg-card) backdrop-blur-md rounded-3xl border border-(--border) shadow-sm overflow-hidden transition-colors duration-300 hover:border-(--border-hover)">
                  <TransactionsTableWidget />
                </div>
              </div>

              {/* Column 2: Tasks */}
              <div className="space-y-6">
                <div className="bg-(--bg-card) backdrop-blur-md rounded-3xl border border-(--border) shadow-sm overflow-hidden transition-colors duration-300 hover:border-(--border-hover)">
                  <TaskListWidget />
                </div>
              </div>

              {/* Column 3: Calendar */}
              <div className="space-y-6 lg:col-span-2 xl:col-span-1">
                <div className="bg-(--bg-card) backdrop-blur-md rounded-3xl border border-(--border) shadow-sm overflow-hidden transition-colors duration-300 hover:border-(--border-hover)">
                  <CalendarWidget />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* MODAL CONFIG */}
      <ConfigModal 
        isOpen={isEditModalOpen}
        isEdit={true}
        editConfig={data} // Truyền data cũ để form điền sẵn
        setIsOpen={setIsEditModalOpen}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating}
      />
    </div>
  );
}