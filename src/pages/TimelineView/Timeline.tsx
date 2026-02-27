import React, { useState, useMemo, type Dispatch, type SetStateAction, useCallback } from "react";
import { Gantt, type Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import TaskToolbar, { type ViewType } from "../../components/Timeline/Toolbar";
import type { OverviewConfig } from "../../types/overview.types";
import type { TaskCreateRequest, TodoItem } from "../../types/todo.types";
import "./timeline.css";
import CalendarModal from "../../components/CalendarModal/Calendarmodal";
import type { CategoryResponse } from "../../types/categories.type";
import type { FlattenedTodo } from "../Calendar/Calendar";

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export interface ExtendedTask extends Task {
  rawTodo?: TodoItem;
  phaseProgress?: number;
  customLevel?: "phase" | "group" | "todo";
  displayName?: string;
}

const INCOMPLETE_TASK_STYLE = {
  backgroundColor: "var(--color-planner-blue-light, #dbeafe)",
  progressColor: "var(--color-planner-blue, #3b82f6)",
  backgroundSelectedColor: "#bfdbfe",
};

const COMPLETED_TASK_STYLE = {
  backgroundColor: "#ECFDF5",         // Emerald-50
  progressColor: "#10B981",           // Emerald-500
  backgroundSelectedColor: "#D1FAE5", // Emerald-100
};

// Đã đồng nhất backgroundColor và progressColor thành 1 màu đỏ duy nhất
const OVERDUE_TASK_STYLE = {
  backgroundColor: "#ef4444", 
  progressColor: "#ef4444",   
  backgroundSelectedColor: "#dc2626",
};

const PHASE_STYLE = {
  backgroundColor: "var(--color-planner-amber, #f59e0b)",
  progressColor: "#d97706",
};

const TRANSPARENT_STYLE = {
  backgroundColor: "transparent",
  backgroundSelectedColor: "transparent",
  progressColor: "transparent",
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const CustomTaskListHeader: React.FC<{ headerHeight: number }> = ({ headerHeight }) => (
  <div className="flex items-end px-5 pb-3 border-b border-border bg-card" style={{ height: headerHeight }}>
    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
      Phases & Tasks
    </span>
  </div>
);

// Thêm props onEditTask và onDeleteTask
const CustomTaskListTable: React.FC<{
  rowHeight: number;
  rowWidth: string;
  tasks: ExtendedTask[];
  onEditTask: (todo: TodoItem) => void;
  onDeleteTask: (id: string) => void;
}> = ({ rowHeight, rowWidth, tasks, onEditTask, onDeleteTask }) => (
  <div className="w-full border-r border-border overflow-hidden" style={{ width: rowWidth }}>
    {tasks.map((task) => {
      const isPhase = task.customLevel === "phase";
      const isGroup = task.customLevel === "group";
      const isTodo = task.customLevel === "todo";

      return (
        <div
          key={task.id}
          className="flex items-center px-4 border-b border-border/50 hover:bg-muted/30 transition-colors group"
          style={{ height: rowHeight }}
        >
          {isPhase && (
            <div className="flex flex-col justify-center w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: PHASE_STYLE.backgroundColor }} />
                <span className="font-bold text-foreground text-sm truncate uppercase">
                  {task.name}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground ml-4 font-medium mt-0.5">
                Tiến độ: <span className="font-bold" style={{ color: PHASE_STYLE.backgroundColor }}>{task.phaseProgress || 0}%</span>
              </span>
            </div>
          )}

          {isGroup && (
            <div className="flex items-center gap-2 w-full pl-6">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                {task.name}
              </span>
            </div>
          )}

          {isTodo && task.rawTodo && (() => {
            const todo = task.rawTodo;
            const isCompleted = todo.status === "completed" || todo.status === "cancelled";
            const isOverdue = !isCompleted && new Date(todo.deadline || 0).getTime() < new Date().getTime();

            return (
              <div className="flex items-center justify-between w-full pl-10 py-1 pr-2">
                <div className="flex flex-col overflow-hidden border-l-2 border-muted-foreground/30 pl-3">
                  <div className="flex items-center gap-1.5">
                    {isCompleted && <span className="text-green-600 font-bold text-xs">✓</span>}
                    {isOverdue && <span className="text-red-500 font-bold text-[10px]">❗</span>}
                    
                    <span className={`text-sm truncate font-medium ${isCompleted ? "text-muted-foreground line-through italic" : "text-foreground"}`}>
                      {todo.title}
                    </span>
                  </div>

                  <span className={`text-[10px] font-medium truncate mt-0.5 ${isOverdue ? "text-red-600 font-bold" : "text-planner-pink"}`}>
                    Deadline: {task.end.toLocaleDateString("vi-VN")} {isOverdue && "(Quá hạn)"}
                  </span>
                </div>

                {/* Nút Action: Hiện ra khi hover vào dòng */}
                <div className="w-20 flex flex-row justify-evenly">
                  <button 
                    onClick={() => onEditTask(todo)}
                    className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                    title="Chỉnh sửa task"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5l13.732-13.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa task này?")) {
                        onDeleteTask(todo.id);
                      }
                    }}
                    className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                    title="Xóa task"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      );
    })}
  </div>
);

const CustomTooltip: React.FC<{ task: ExtendedTask }> = ({ task }) => (
  <div className="bg-white text-popover-foreground border border-border rounded-xl shadow-lg p-3 z-50">
    <p className="font-semibold text-sm mb-1">{task.rawTodo ? task.rawTodo.title : task.name}</p>
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Start: {task.start.toLocaleDateString("vi-VN")}</p>
      <p>End: {task.end.toLocaleDateString("vi-VN")}</p>
      {task.type !== "project" && task.rawTodo && (
        <p>Trạng thái: <span className="font-medium uppercase" style={{ color: task.rawTodo.status === "completed" ? "green" : "#3b82f6" }}>
          {task.rawTodo.status}
        </span></p>
      )}
    </div>
  </div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function TimelineModule({
  overviewConfig,
  categories,
  setTasks,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
}: {
  overviewConfig: OverviewConfig | undefined;
  categories: CategoryResponse[];
  setTasks: Dispatch<SetStateAction<OverviewConfig | undefined>>;
  onUpdateTask: (id: string, updatedTask: any) => Promise<void>;
  onCreateTask: (newTask: TaskCreateRequest) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}) {
  const [currentView, setCurrentView] = useState<ViewType>("day");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // State quản lý task đang được edit
  const [editingTask, setEditingTask] = useState<FlattenedTodo | null>(null);

  const ganttTasks = useMemo(() => {
    if (!overviewConfig || !overviewConfig.phases) return [];

    const flatTasks: ExtendedTask[] = [];

    const sortedPhases = [...overviewConfig.phases].sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );

    sortedPhases.forEach((phase) => {
      const phaseStart = phase.start_date ? new Date(phase.start_date) : new Date();
      let phaseEnd = phase.end_date ? new Date(phase.end_date) : new Date(phaseStart.getTime() + 86400000 * 7);
      
      if (phaseEnd.getTime() < phaseStart.getTime()) {
        phaseEnd = new Date(phaseStart.getTime() + 86400000);
      }

      const totalTasks = phase.tasks?.length || 0;
      const completedTasks = phase.tasks?.filter((t) => t.status === "completed").length || 0;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      flatTasks.push({
        id: phase.id,
        type: "task",
        customLevel: "phase",
        name: phase.name,
        displayName: phase.name,
        start: phaseStart,
        end: phaseEnd,
        progress: progressPercent,
        phaseProgress: progressPercent,
        styles: PHASE_STYLE,
      });

      const sortByDeadline = (a: TodoItem, b: TodoItem) => 
        new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();

      const regularTasks = (phase.tasks?.filter((t) => !t.is_shopping) || []).sort(sortByDeadline);
      const shoppingTasks = (phase.tasks?.filter((t) => t.is_shopping) || []).sort(sortByDeadline);

      const pushSubTasks = (tasksList: TodoItem[], groupName: string, groupIdSuffix: string) => {
        if (tasksList.length === 0) return;

        flatTasks.push({
          id: `${phase.id}-${groupIdSuffix}`,
          type: "task",
          customLevel: "group",
          name: groupName,
          displayName: groupName,
          start: phaseStart,
          end: phaseEnd,
          progress: 0,
          styles: TRANSPARENT_STYLE,
        });

        tasksList.forEach((todo) => {
          const deadlineDate = todo.deadline ? new Date(todo.deadline) : new Date();
          const taskStart = deadlineDate.getTime() > phaseStart.getTime() 
            ? phaseStart 
            : new Date(deadlineDate.getTime() - 86400000);
          
          const isCompleted = todo.status === "completed" || todo.status === "cancelled";
          const isOverdue = !isCompleted && deadlineDate.getTime() < new Date().getTime();

          let currentStyle = INCOMPLETE_TASK_STYLE;
          let displayName = todo.title;

          if (isCompleted) {
            currentStyle = COMPLETED_TASK_STYLE;
            displayName = `✓ ${todo.title}`;
          } else if (isOverdue) {
            currentStyle = OVERDUE_TASK_STYLE;
            displayName = `❗ ${todo.title}`;
          }

          flatTasks.push({
            id: todo.id,
            type: "task",
            customLevel: "todo",
            name: displayName,
            start: taskStart,
            end: deadlineDate,
            progress: isCompleted ? 100 : todo.done_percentage || 0,
            rawTodo: todo,
            styles: currentStyle,
          });
        });
      };

      pushSubTasks(regularTasks, "CÔNG VIỆC CẦN LÀM", "group-regular");
      pushSubTasks(shoppingTasks, "DANH SÁCH MUA SẮM", "group-shopping");
    });

    return flatTasks;
  }, [overviewConfig]);

  const ganttViewMode = useMemo(() => {
    switch (currentView) {
      case "week": return ViewMode.Week;
      case "month": return ViewMode.Month;
      case "day":
      default: return ViewMode.Day;
    }
  }, [currentView]);

  const handleTaskChange = async (task: Task) => {
    const extended = task as ExtendedTask;
    if (extended.type === "project" || !extended.rawTodo) return;

    const updatedTodo = {
      deadline: task.end.toISOString(),
    };
    await onUpdateTask(extended.id, updatedTodo);
  };

  const handleEditOpen = useCallback((todo: FlattenedTodo) => {
    setEditingTask(todo);
    setIsModalOpen(true);
  }, []);

  const handleAddOpen = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Wrapper để truyền được function vào CustomTaskListTable
  const TaskListTableWrapper = useCallback((props: any) => (
    <CustomTaskListTable 
      {...props} 
      onEditTask={handleEditOpen} 
      onDeleteTask={onDeleteTask} 
    />
  ), [handleEditOpen, onDeleteTask]);

  if (!overviewConfig || ganttTasks.length === 0) {
    return (
      <div className="p-10 text-center text-muted-foreground font-medium">
        Loading Data...
      </div>
    );
  }

  return (
    <div className="bg-background">
      <main className="mx-auto px-4 sm:px-6 lg:px-8">
        <TaskToolbar
          activeView={currentView}
          onViewChange={setCurrentView}
          onAddClick={handleAddOpen}
        />

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Gantt
              tasks={ganttTasks}
              viewMode={ganttViewMode}
              onDateChange={handleTaskChange}
              listCellWidth="380px"
              rowHeight={40}
              columnWidth={ganttViewMode === ViewMode.Day ? 60 : 150}
              TaskListHeader={CustomTaskListHeader}
              TaskListTable={TaskListTableWrapper}
              TooltipContent={CustomTooltip}
              barCornerRadius={8}
              barFill={70}
              todayColor="rgba(59, 130, 246, 0.2)"
              // onDoubleClick đã được loại bỏ ở đây
            />
          </div>
        </div>

        <CalendarModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editingTask={editingTask} // Đã truyền task cần edit vào đây
          selectedDate={null}
          overviewConfig={overviewConfig}
          categories={categories}
          onUpdateTask={onUpdateTask}
          onCreateTask={onCreateTask}
        />
      </main>
    </div>
  );
}