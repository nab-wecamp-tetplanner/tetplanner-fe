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

export default function PlanningOverview() {
  const [activeView, setActiveView] = useState<"calendar" | "timeline">(
    "calendar",
  );
  const { configId } = useAppStore();
  const { showLoading, hideLoading } = useLoading();

  // Dữ liệu mẫu tập trung
  const [tasksByPhase, setTasksByPhase] = useState<OverviewConfig>();
  const [catergories, setCategories] = useState<CategoryResponse[]>([]);

  // Hàm cập nhật task chung cho cả 2 component
  const handleUpdateTask = async (id: string, updatedTask: any) => {
    try {
      console.log("UPDATE TASK: ", updatedTask, id);
      const response = await apiClient.todos.update(id, updatedTask);
      const savedTask = response.todo_item || response;

      setTasksByPhase((prevData) => {
        if (!prevData || !prevData.phases) return prevData;

        const updatedPhases = prevData.phases.map((phase) => {
          const isTargetPhase = phase.id === savedTask.timeline_phase.id;
          const isTaskInPhase = phase.tasks.some((t) => t.id === id);

          // Trường hợp 1: Task vẫn ở phase cũ (hoặc đây là phase đích)
          if (isTargetPhase) {
            if (isTaskInPhase) {
              return {
                ...phase,
                tasks: phase.tasks.map((t) => (t.id === id ? savedTask : t)),
              };
            } else {
              // Task từ phase khác chuyển đến -> Thêm vào cuối (vì trước đó nó không có vị trí ở đây)
              return {
                ...phase,
                tasks: [...phase.tasks, savedTask],
              };
            }
          }

          // Trường hợp 2: Task không thuộc phase này sau khi update, nhưng trước đó thì có
          // Nghĩa là task đã chuyển sang phase khác -> Xóa nó khỏi phase này
          if (isTaskInPhase) {
            return {
              ...phase,
              tasks: phase.tasks.filter((t) => t.id !== id),
            };
          }

          // Trường hợp 3: Phase không liên quan
          return phase;
        });

        return { ...prevData, phases: updatedPhases };
      });
    } catch (error) {
      console.error(error);
      toast.error("Error in updating!");
    }
  };

  // Create tassk
  const createTask = async (newTask: TaskCreateRequest) => {
    try {
      console.log("New task 1: ", newTask);
      const savedTask: TodoItem = await apiClient.todos.create(newTask);
      console.log("NEW TASSK: ", newTask);
      setTasksByPhase((prevData) => {
        if (!prevData || !prevData.phases) return prevData;

        // add New task to selected phase
        const updatedPhases = prevData.phases.map((phase) => {
          if (phase.id === savedTask.timeline_phase.id) {
            return {
              ...phase,
              tasks: [...(phase.tasks || []), savedTask],
            };
          }
          return phase;
        });

        // return new state
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
      showLoading();
      await apiClient.todos.delete(id);

      setTasksByPhase((prevData) => {
        if (!prevData || !prevData.phases) return prevData;

        const updatedPhases = prevData.phases.map((phase) => {
          // 1. Xóa task khỏi phase hiện tại (dù nó có ở đây hay không)
          const filteredTasks = phase.tasks.filter((t) => t.id !== id);
          return {
            ...phase,
            tasks: filteredTasks,
          };
        });

        return { ...prevData, phases: updatedPhases };
      });
    } catch (error) {
    } finally {
      hideLoading();
    }
  };

  const fetchCategories = async () => {
    if (!configId) return;
    try {
      showLoading();
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

  // Fetch data
  useEffect(() => {
    if (!configId) return;
    featchData();
    fetchCategories();
  }, [configId]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto">
        {/* Header điều hướng riêng của Planner */}
        <header className="flex flex-row md:flex-row md:items-center justify-between gap-4 px-6 mb-2">
          <div className="w-8/12 p-2">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-planner-green-light flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-planner-green" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Done
                  </p>
                  <p className="text-xl font-bold text-planner-green">{}</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-planner-pink-light flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-planner-pink" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Overdue
                  </p>
                  <p className="text-xl font-bold text-planner-pink">03</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-planner-blue-light flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-planner-blue" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Total Tasks
                  </p>
                  <p className="text-xl font-bold text-planner-blue">
                    {tasksByPhase?.phases.reduce(
                      (acc, curr) => acc + curr.tasks.length,
                      0,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className=" flex bg-muted/50 p-1.5 rounded-2xl border border-border shadow-sm">
            <button
              onClick={() => setActiveView("calendar")}
              className={`h-full w-full flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-all ${
                activeView === "calendar"
                  ? "bg-background text-planner-blue shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-4 h-4" /> Calendar
            </button>
            <button
              onClick={() => setActiveView("timeline")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-all ${
                activeView === "timeline"
                  ? "bg-background text-planner-blue shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" /> Timeline
            </button>
          </div>
        </header>

        {/* Nội dung thay đổi dựa trên View */}
        <div className="transition-all duration-500 ease-in-out">
          {activeView === "calendar" && !!tasksByPhase ? (
            <CalendarPage
              overviewConfig={tasksByPhase}
              categories={catergories}
              setTasks={setTasksByPhase}
              onUpdateTask={handleUpdateTask}
              onCreateTask={createTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : (
            <TimelineModule
              overviewConfig={tasksByPhase}
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
  );
}
