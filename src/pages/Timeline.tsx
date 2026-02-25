import React, { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import { Gantt, type Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css"; 
import TaskToolbar, { type ViewType } from "../components/Timeline/Toolbar";
import type { OverviewConfig } from "../types/overview.types";
import type { TodoItem } from "../types/todo.types";

// ==========================================
// TYPES & INTERFACES
// ==========================================

// Mở rộng Task type của gantt-task-react để nhét thêm dữ liệu gốc
export interface ExtendedTask extends Task {
  rawTodo?: TodoItem; // Lưu trữ data thật để gọi API khi update
  assignees?: { initials: string; bgColor: string; textColor: string }[];
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

const CustomTaskListHeader: React.FC<{ headerHeight: number }> = ({ headerHeight }) => {
  return (
    <div
      className="flex items-end px-5 pb-3 border-b border-border bg-card"
      style={{ height: headerHeight }}
    >
      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Phases & Tasks
      </span>
    </div>
  );
};

// SỬA: Nhận thẳng mảng `tasks` từ thư viện Gantt truyền vào để đồng bộ row
const CustomTaskListTable: React.FC<{
  rowHeight: number;
  rowWidth: string;
  tasks: ExtendedTask[]; 
}> = ({ rowHeight, rowWidth, tasks }) => {
  return (
    <div className="bg-card w-full border-r border-border overflow-hidden" style={{ width: rowWidth }}>
      {tasks.map((task) => {
        const isProject = task.type === "project";

        return (
          <div
            key={task.id}
            className="flex items-center px-4 border-b border-border/50 hover:bg-muted/30 transition-colors"
            style={{ height: rowHeight }}
          >
            {isProject ? (
              <div className="flex items-center gap-2 w-full">
                <div className="w-2 h-2 rounded-sm bg-planner-green" />
                <span className="font-bold text-foreground text-sm truncate">
                  {task.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full pl-6">
                <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {task.rawTodo?.priority === "high" || task.rawTodo?.priority === "urgent" ? "🔥" : "📌"}
                  </span>
                </div>
                <span className={`text-sm truncate flex-1 font-medium ${task.progress === 100 ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {task.name}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const CustomTooltip: React.FC<{ task: ExtendedTask }> = ({ task }) => {
  return (
    <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg p-3 z-50">
      <p className="font-semibold text-sm mb-1">{task.name}</p>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Start: {task.start.toLocaleDateString("vi-VN")}</p>
        <p>End: {task.end.toLocaleDateString("vi-VN")}</p>
        {task.type !== "project" && (
          <p>Trạng thái: <span className="font-medium text-planner-blue uppercase">{task.rawTodo?.status}</span></p>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function TimelineModule({
  tasks: overviewConfig,
  setTasks,
  onUpdateTask
}: {
  tasks?: OverviewConfig;
  setTasks: Dispatch<SetStateAction<OverviewConfig | undefined>>;
  onUpdateTask: (id: string, updatedTask: TodoItem) => Promise<void>;
}) {
  const [currentView, setCurrentView] = useState<ViewType>("day");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. DATA MAPPING TRẢI PHẲNG (Logic cốt lõi)
  // 1. DATA MAPPING TRẢI PHẲNG (Đã fix lỗi crash getTime)
  const ganttTasks = useMemo(() => {
    if (!overviewConfig || !overviewConfig.phases) return [];

    const flatTasks: ExtendedTask[] = [];

    overviewConfig.phases.forEach((phase) => {
      // Ép kiểu an toàn cho Phase
      const phaseStart = phase.start_date ? new Date(phase.start_date) : new Date();
      let phaseEnd = phase.end_date ? new Date(phase.end_date) : new Date(phaseStart.getTime() + 86400000 * 7); // Mặc định +7 ngày nếu thiếu
      
      // Chống lỗi thời gian ngược của Phase
      if (phaseEnd.getTime() < phaseStart.getTime()) {
        phaseEnd = new Date(phaseStart.getTime() + 86400000); 
      }

      flatTasks.push({
        id: phase.id,
        type: "project",
        name: phase.name,
        start: phaseStart,
        end: phaseEnd,
        progress: 100,
        hideChildren: false,
        displayOrder: phase.display_order,
        styles: { progressColor: "#10b981", progressSelectedColor: "#059669" }
      });

      phase.tasks?.forEach((todo) => {
        if (searchTerm && !todo.title.toLowerCase().includes(searchTerm.toLowerCase())) return;

        let progressVal = 0;
        if (todo.status === "completed") progressVal = 100;
        else if (todo.status === "in_progress") progressVal = 50;

        const todoStart = todo.created_at ? new Date(todo.created_at) : new Date();
        
        let todoEnd = todo.deadline ? new Date(todo.deadline) : new Date(todoStart.getTime() + 86400000);

        if (todoEnd.getTime() < todoStart.getTime()) {
          todoEnd = new Date(todoStart.getTime() + 86400000);
        }

        flatTasks.push({
          id: todo.id,
          type: "task",
          name: todo.title,
          start: todoStart,
          end: todoEnd,
          project: phase.id,
          progress: progressVal,
          rawTodo: todo,
          styles: {
            backgroundColor: todo.status === "completed" ? "#6ee7b7" : "#93c5fd",
            progressColor: todo.status === "completed" ? "#10b981" : "#3b82f6",
          },
        });
      });
    });

    return flatTasks.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [overviewConfig, searchTerm]);

  const ganttViewMode = useMemo(() => {
    switch (currentView) {
      case "day": return ViewMode.Day;
      case "week": return ViewMode.Week;
      case "month": return ViewMode.Month;
      default: return ViewMode.Day;
    }
  }, [currentView]);

  const handleTaskChange = async (task: Task) => {
    const extended = task as ExtendedTask;
    if (extended.type === "project") return; 

    if (extended.rawTodo) {
      const updatedTodo: TodoItem = {
        ...extended.rawTodo,
        deadline: task.end.toISOString(),
      };
      
      await onUpdateTask(extended.id, updatedTodo);
    }
  };

  const handleDblClick = (task: Task) => {
    const extended = task as ExtendedTask;
    if (extended.type !== "project") {
      alert(`Mở Modal chỉnh sửa cho Task: ${task.name}`);
    }
  };

  if (!overviewConfig || ganttTasks.length === 0) {
    return <div className="p-10 text-center text-muted-foreground font-medium">No tasks available to show on Timeline.</div>;
  }

  return (
    <div className="bg-background">
      <main className="mx-auto px-4 sm:px-6 lg:px-8">
        <TaskToolbar 
          activeView={currentView}
          onViewChange={setCurrentView}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddClick={() => alert("Mở Modal thêm Task của Timeline")}
        />

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .gantt-container { font-family: inherit !important; }
            .gantt .grid-row { fill: transparent !important; }
            .gantt .grid-row:nth-child(even) { fill: rgba(0,0,0, 0.01) !important; }
            .gantt .grid-line { stroke: hsl(var(--border) / 0.5) !important; }
            .gantt .tick text { fill: hsl(var(--muted-foreground)) !important; font-size: 11px !important; font-weight: 500 !important; }
            .gantt .bar-label { fill: #ffffff !important; font-weight: 500 !important; font-size: 12px !important; } 
            .gantt-task-react-header-container { background: transparent !important; }
          `,
            }}
          />

          <div className="overflow-x-auto">
            <Gantt
              tasks={ganttTasks}
              viewMode={ganttViewMode}
              onDateChange={handleTaskChange}
              onDoubleClick={handleDblClick}
              listCellWidth="300px"
              rowHeight={50}
              ganttHeight={500}
              columnWidth={ganttViewMode === ViewMode.Day ? 60 : 150}
              TaskListHeader={CustomTaskListHeader}
              TaskListTable={CustomTaskListTable}
              TooltipContent={CustomTooltip}
              barCornerRadius={8}
              barFill={70}
              todayColor="rgba(59, 130, 246, 0.1)"
            />
          </div>
        </div>
      </main>
    </div>
  );
}