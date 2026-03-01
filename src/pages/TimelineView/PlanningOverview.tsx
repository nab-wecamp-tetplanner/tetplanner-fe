import { useState, useEffect } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import TimelineModule from "./Timeline";
import CalendarPage from "../Calendar/Calendar";
import type { OverviewConfig } from "../../types/overview.types";
import { useAppStore } from "../../stores/useAppStore";
import apiClient from "../../services/apiClient";
import type { TaskCreateRequest, TodoItem } from "../../types/todo.types";
import type { CategoryResponse } from "../../types/categories.type";
import { useLoading } from "../../contexts/LoadingContext";
import { toast } from "react-toastify";

// DECORATIVE COMPONENTS MỚI THÊM VÀO
import FallingPetals from "../../components/FallingPetals/FallingPetals";
import {
  Lantern,
  BlossomBranch,
  CloudMotif,
  TraditionalCake,
} from "../../components/Decoratives/Decoratives";

// types.ts hoặc để trên đầu file
export interface AppTask {
  id: string;
  title: string; // Tên hiển thị trên Calendar/Board
  startDate: Date;
  endDate: Date;
  project: string;
  priority: "high" | "medium" | "low";
  status: "completed" | "pending" | "cancelled";
  progress: number; // Dùng cho Timeline
}

interface StatProps {
  total: number;
  completed: number;
  overdue: number;
}

// KHAI BÁO BACKGROUND PATTERN
const BACKGROUND_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d6cfc4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export default function PlanningOverview() {
  const [activeView, setActiveView] = useState<"calendar" | "timeline">(
    "calendar",
  );
  const { configId } = useAppStore();
  const { showLoading, hideLoading } = useLoading();

  // Dữ liệu mẫu tập trung
  const [tasksByPhase, setTasksByPhase] = useState<OverviewConfig>();
  const [catergories, setCategories] = useState<CategoryResponse[]>([]);
  const [stats, setStats] = useState<StatProps>({
    total: 0,
    completed: 0,
    overdue: 0,
  });

  // Hàm cập nhật task chung cho cả 2 component
  const handleUpdateTask = async (id: string, updatedTask: any) => {
    try {
      console.log("UPDATE TASK: ", updatedTask, id);
      if (!configId) return;
      showLoading();
      const response = await apiClient.todos.update(id, updatedTask);
      const savedTask = response.todo_item || response;

      setTasksByPhase((prevData) => {
        if (!prevData || !prevData.phases) return prevData;

        const updatedPhases = prevData.phases.map((phase) => {
          const isTargetPhase = phase.id === savedTask.timeline_phase.id;
          const isTaskInPhase = phase.tasks.some((t) => t.id === id);

          if (isTargetPhase) {
            if (isTaskInPhase) {
              return {
                ...phase,
                tasks: phase.tasks.map((t) => (t.id === id ? savedTask : t)),
              };
            } else {
              return {
                ...phase,
                tasks: [...phase.tasks, savedTask],
              };
            }
          }

          if (isTaskInPhase) {
            return {
              ...phase,
              tasks: phase.tasks.filter((t) => t.id !== id),
            };
          }

          return phase;
        });

        return { ...prevData, phases: updatedPhases };
      });
    } catch (error) {
      console.error(error);
      toast.error("Error in updating!");
    } finally {
      hideLoading();
    }
  };

  // Create task
  const createTask = async (newTask: TaskCreateRequest) => {
    try {
      console.log("New task 1: ", newTask);
      const savedTask: TodoItem = await apiClient.todos.create(newTask);
      console.log("NEW TASSK: ", newTask);
      setTasksByPhase((prevData) => {
        if (!prevData || !prevData.phases) return prevData;

        const updatedPhases = prevData.phases.map((phase) => {
          if (phase.id === savedTask.timeline_phase.id) {
            return {
              ...phase,
              tasks: [...(phase.tasks || []), savedTask],
            };
          }
          return phase;
        });

        return {
          ...prevData,
          phases: updatedPhases,
        };
      });
    } catch (error) {
      console.error("Lỗi khi tạo task:", error);
      toast.error("Error in creating tassk");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      if (!id) return;
      await apiClient.todos.delete(id);

      setTasksByPhase((prevData) => {
        if (!prevData || !prevData.phases) return prevData;

        const updatedPhases = prevData.phases.map((phase) => {
          const filteredTasks = phase.tasks.filter((t) => t.id !== id);
          return {
            ...phase,
            tasks: filteredTasks,
          };
        });

        return { ...prevData, phases: updatedPhases };
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      hideLoading();
    }
  };

  const fetchCategories = async () => {
    if (!configId) return;
    try {
      const categoriesData =
        await apiClient.categories.getByTetConfig(configId);
      setCategories(categoriesData);
    } catch (error) {
      console.log(error);
    } finally {
      hideLoading();
    }
  };

  const featchData = async () => {
    if (!configId) return {};

    const [configInfo, budgetSumamry, phases] = await Promise.all([
      apiClient.tetConfigs.getConfigById(configId),
      apiClient.tetConfigs.getBudgetSummary(configId),
      apiClient.timelinePhases.getByConfigId(configId),
    ]);

    const fullPhaseData = await Promise.all(
      phases.map(async (phase) => {
        const tasks = await apiClient.todos.getAll({
          tetConfigId: configId,
          timelinePhaseId: phase.id,
        });

        return {
          ...phase,
          tet_config: {
            id: configId,
          },
          tasks: tasks,
        };
      }),
    );

    const data: OverviewConfig = {
      ...configInfo,
      config_summary: budgetSumamry,
      phases: fullPhaseData,
    };

    console.log(`Full overview data: `, data);
    setTasksByPhase(data);
  };

  const calculateTaskStats = () => {
    if (!tasksByPhase) return;
    const statsData = tasksByPhase.phases.reduce(
      (acc, phase) => {
        const tasks = phase.tasks || [];

        acc.total += tasks.length;
        acc.completed += tasks.filter(
          (task) => task.status === "completed",
        ).length;
        acc.overdue += tasks.filter((task) => task.is_overdue).length;

        return acc;
      },
      { total: 0, completed: 0, overdue: 0 },
    );
    setStats(statsData);
  };

  useEffect(() => {
    calculateTaskStats();
  }, [tasksByPhase]);

  // Fetch data
  useEffect(() => {
    if (!configId) return;
    featchData();
    fetchCategories();
  }, [configId]);

  return (
    <div className="relative min-h-screen bg-((--bg) text-((--text) transition-colors duration-500 overflow-hidden font-sans pb-10">
      {/* Background Pattern & Warm Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 tet-deco-element"
        style={{
          backgroundImage: BACKGROUND_PATTERN,
          opacity: "var(--pattern-opacity)",
        }}
      ></div>
      <div
        className="absolute inset-0 pointer-events-none z-0 tet-deco-element"
        style={{
          background: `radial-gradient(ellipse at 20% 0%, var(--gradient-bg-1) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, var(--gradient-bg-2) 0%, transparent 50%)`,
        }}
      ></div>

      {/* Decorative Elements - Định vị ở các góc, ẩn đi trong theme Minimal */}
      <div className="tet-deco-element">
        <FallingPetals count={15} />
      </div>
      <Lantern
        className="absolute top-6 right-20 animate-[swing_4s_ease-in-out_infinite] z-0 opacity-70 tet-deco-element"
        size="sm"
      />
      <BlossomBranch
        className="absolute top-24 -left-10 animate-[float_6s_ease-in-out_infinite] z-0 opacity-80 tet-deco-element transform scale-75"
        variant="apricot"
      />
      <BlossomBranch
        className="absolute top-40 -right-8 animate-[float_5s_ease-in-out_infinite_reverse] z-0 transform scale-x-[-1] scale-75 opacity-80 tet-deco-element"
        variant="peach"
      />
      <CloudMotif className="absolute top-10 left-[25%] animate-[float_7s_ease-in-out_infinite] z-0 opacity-40 tet-deco-element" />
      <TraditionalCake
        className="absolute bottom-5 left-8 z-0 opacity-30 animate-[float_4s_ease-in-out_infinite] tet-deco-element"
        variant="tet"
      />

      {/* MAIN CONTENT WRAPPER (Z-index cao để đè lên trang trí) */}
      <div className="relative z-10 mx-auto p-4 ">
        {/* Header điều hướng riêng của Planner */}
        {/* Header điều hướng riêng của Planner */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 px-2 lg:px-6 mb-10 mt-6">
          {/* Chỉnh md:w-9/12 (75%) xuống md:w-[71%] để tổng thể ngắn lại 1 tí (~5px mỗi card) */}
          <div className="w-full md:w-[64%]">
            {/* QUICK STATS: Giảm gap từ 4 xuống 3 để các thẻ xích lại gần nhau hơn */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat: Done */}
              <div className="flex items-center justify-between p-4 bg-(--bg-card) border border-accent/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] group hover:border-(--success)/50 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-(--success)/10 flex items-center justify-center border border-(--success)/20">
                    <CheckCircle2 className="w-5 h-5 text-(--success)" />
                  </div>
                  <div>
                    <p className="text-[11px] text-(--text-muted) tracking-wider mb-0.5">
                      Completed
                    </p>
                    <h3 className="text-xl font-black text-(--text-heading) leading-none">
                      {stats.completed}
                    </h3>
                  </div>
                </div>
                {/* Tag nhỏ lại còn 9px theo ý Nhi */}
                <div className="text-[9px] font-bold text-(--success) bg-(--success)/10 px-1.5 py-0.5 rounded-md">
                  Success
                </div>
              </div>

              {/* Stat: Overdue */}
              <div className="flex items-center justify-between p-4 bg-(--bg-card) border border-accent/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] group hover:border-(--danger)/50 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-(--danger)/10 flex items-center justify-center border border-(--danger)/20">
                    <AlertCircle className="w-5 h-5 text-(--danger)" />
                  </div>
                  <div>
                    <p className="text-[11px] text-(--text-muted) tracking-wider mb-0.5">
                      Overdue
                    </p>
                    <h3 className="text-xl font-black text-(--danger) leading-none">
                      {stats.overdue}
                    </h3>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-(--danger) bg-(--danger)/10 px-1.5 py-0.5 rounded-md animate-pulse">
                  Action Required
                </div>
              </div>

              {/* Stat: Total */}
              <div className="flex items-center justify-between p-4 bg-(--bg-card) border border-accent/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] group hover:border-(--primary)/50 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-(--primary)/10 flex items-center justify-center border border-(--primary)/20">
                    <ListTodo className="w-5 h-5 text-(--primary)" />
                  </div>
                  <div>
                    <p className="text-[11px] text-(--text-muted) tracking-wider mb-0.5">
                      Total Pool
                    </p>
                    <h3 className="text-xl font-black text-(--text-heading) leading-none">
                      {stats.total}
                    </h3>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-(--primary) bg-(--primary)/10 px-1.5 py-0.5 rounded-md">
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* Nút Toggle View - Giữ nguyên 100% */}
          <div className="flex bg-accent/10 p-1.5 rounded-xl border border-accent/40 h-fit shrink-0">
            <button
              onClick={() => setActiveView("calendar")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                activeView === "calendar"
                  ? "bg-(--bg-card) text-(--primary) shadow-sm border border-accent/20"
                  : "text-(--text-muted) hover:text-(--text-heading)"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </button>
            <button
              onClick={() => setActiveView("timeline")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                activeView === "timeline"
                  ? "bg-(--bg-card) text-(--primary) shadow-sm border border-accent/20"
                  : "text-(--text-muted) hover:text-(--text-heading)"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Timeline
            </button>
          </div>
        </header>
        {/* Nội dung thay đổi dựa trên View - Sửa lại logic render */}
        <div className="transition-all duration-500 ease-in-out px-2 lg:px-6">
          <div className=" backdrop-blur-sm rounded-4xl border border-(--border) shadow-sm p-4 md:p-6 overflow-hidden min-h-150">
            {/* CHỈ dùng activeView để chọn Component, không dùng tasksByPhase để check ở đây */}
            {activeView === "calendar" ? (
              <CalendarPage
                overviewConfig={tasksByPhase} // Truyền data xuống, nếu undefined nó tự hiện CalendarSkeleton
                categories={catergories}
                setTasks={setTasksByPhase}
                onUpdateTask={handleUpdateTask}
                onCreateTask={createTask}
                onDeleteTask={handleDeleteTask}
              />
            ) : (
              <TimelineModule
                overviewConfig={tasksByPhase} // Truyền data xuống, nếu undefined nó tự hiện TimelineSkeleton
                categories={catergories}
                onCreateTask={createTask}
                onDeleteTask={handleDeleteTask}
                setTasks={setTasksByPhase}
                onUpdateTask={handleUpdateTask}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
