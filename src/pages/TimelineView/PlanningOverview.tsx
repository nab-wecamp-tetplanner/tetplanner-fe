import React, { useState, useMemo, useEffect } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import TimelineModule from "../Timeline";
import CalendarPage from "../Calendar/Calendar";
import type { OverviewConfig } from "../../types/overview.types";
import { useAppStore } from "../../stores/useAppStore";
import apiClient from "../../services/apiClient";
import type { TodoItem } from "../../types/todo.types";

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
  const {configId} = useAppStore();

  // Dữ liệu mẫu tập trung
  const [tasksByPhase, setTasksByPhase] = useState<OverviewConfig>();


  // Hàm cập nhật task chung cho cả 2 component
  const handleUpdateTask = async (id:string, updatedTask: TodoItem) => {
    const newTask = await apiClient.todos.update(id , {
      ... updatedTask
    });
  };

  // Fetch data
  useEffect(() => {
    if (!configId) return;

    const featchData = async () => {
      const [configInfo, budgetSumamry, phases] = await Promise.all([
        apiClient.tetConfigs.getConfigById(configId),
        apiClient.tetConfigs.getBudgetSummary(configId),
        apiClient.timelinePhases.getByConfigId(configId)
      ])
      
      const fullPhaseData = await Promise.all(
        phases.map(async (phase) => {
          const tasks = await apiClient.todos.getAll({
            tetConfigId: configId,
            timelinePhaseId: phase.id
          })

          return {
            ... phase,
            tasks: tasks
          }
        })
      )

      const data : OverviewConfig = {
        ...configInfo,
        config_summary: budgetSumamry,
        phases: fullPhaseData
      }
      
      console.log(`Full overview data: `, data)
      setTasksByPhase(data);
    }

    featchData();
  }, [configId])

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
                  <p className="text-xl font-bold text-planner-green">85%</p>
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
                    {tasksByPhase?.phases.reduce((acc, curr) => (acc + curr.tasks.length), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border shadow-sm w-fit">
            <button
              onClick={() => setActiveView("calendar")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-all ${
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
              tasks={tasksByPhase}
              setTasks={setTasksByPhase}
              onUpdateTask={handleUpdateTask}
            />
          ) : (
            <TimelineModule
              tasks={tasksByPhase}
              setTasks={setTasksByPhase}
              onUpdateTask={handleUpdateTask}
            />
          )}
        </div>
      </div>
    </div>
  );
}
