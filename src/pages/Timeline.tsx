import React, {
  useState,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Gantt, type Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import TaskToolbar, { type ViewType } from "../components/Timeline/Toolbar";
import type { OverviewConfig } from "../types/overview.types";
import type { TodoItem } from "../types/todo.types";
import { ListFilter } from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface ExtendedTask extends Task {
  rawTodo?: TodoItem;
  phaseProgress?: number; // % hoàn thành của phase
  assignees?: { initials: string; bgColor: string; textColor: string }[];
  customLevel?: "phase" | "group" | "todo"; // Thêm dòng này để đánh dấu level
  displayName?: string;
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

const CustomTaskListHeader: React.FC<{ headerHeight: number }> = ({
  headerHeight,
}) => {
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

const CustomTaskListTable: React.FC<{
  rowHeight: number;
  rowWidth: string;
  tasks: ExtendedTask[];
}> = ({ rowHeight, rowWidth, tasks }) => {
  return (
    <div
      className="bg-card w-full border-r border-border overflow-hidden"
      style={{ width: rowWidth }}
    >
      {tasks.map((task) => {
        // Dùng customLevel để render giao diện, không phụ thuộc vào type của thư viện nữa
        const isPhase = task.customLevel === "phase";
        const isGroup = task.customLevel === "group";
        const isTodo = task.customLevel === "todo";

        return (
          <div
            key={task.id}
            className="flex items-center px-4 border-b border-border/50 hover:bg-muted/30 transition-colors"
            style={{ height: rowHeight }}
          >
            {/* LEVEL 1: PHASE */}
            {isPhase && (
              <div className="flex flex-col justify-center w-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-planner-green shrink-0" />
                  <span className="font-bold text-foreground text-sm truncate uppercase">
                    {task.name}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground ml-4 font-medium mt-0.5">
                  Tiến độ:{" "}
                  <span className="text-planner-blue">
                    {task.phaseProgress || 0}%
                  </span>
                </span>
              </div>
            )}

            {/* LEVEL 2: GROUP */}
            {isGroup && (
              <div className="flex items-center gap-2 w-full pl-6">
                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  {task.name}
                </span>
              </div>
            )}

           {/* LEVEL 3: TODO */}
            {isTodo && (
              <div className="flex items-center gap-3 w-full pl-10 py-1">
                {/* ĐÃ XÓA BLOCK ICON Ở ĐÂY */}
                <div className="flex flex-col w-full overflow-hidden border-l-2 border-muted-foreground/30 pl-3">
                  <span
                    className={`text-sm truncate font-medium ${task.progress === 100 ? "text-muted-foreground line-through" : "text-foreground"}`}
                  >
                    {task.name}
                  </span>
                  <span className="text-[10px] text-planner-pink font-medium truncate mt-0.5">
                    Deadline: {task.end.toLocaleDateString("vi-VN")}
                  </span>
                </div>
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
          <p>
            Trạng thái:{" "}
            <span className="font-medium text-planner-blue uppercase">
              {task.rawTodo?.status}
            </span>
          </p>
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
  onUpdateTask,
}: {
  tasks?: OverviewConfig;
  setTasks: Dispatch<SetStateAction<OverviewConfig | undefined>>;
  onUpdateTask: (id: string, updatedTask: TodoItem) => Promise<void>;
}) {
  const [currentView, setCurrentView] = useState<ViewType>("day");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. DATA MAPPING TRẢI PHẲNG (Logic cốt lõi)

const ganttTasks = useMemo(() => {
    if (!overviewConfig || !overviewConfig.phases) return [];

    const flatTasks: ExtendedTask[] = [];
    const now = new Date(); // Lấy thời điểm hiện tại để so sánh deadline

    // Sắp xếp các phases theo thứ tự hiển thị
    const sortedPhases = [...overviewConfig.phases].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    sortedPhases.forEach((phase) => {
      // --- (Giữ nguyên logic tính ngày tháng của Phase) ---
      const phaseStart = phase.start_date ? new Date(phase.start_date) : new Date();
      let phaseEnd = phase.end_date ? new Date(phase.end_date) : new Date(phaseStart.getTime() + 86400000 * 7);
      if (phaseEnd.getTime() < phaseStart.getTime()) {
        phaseEnd = new Date(phaseStart.getTime() + 86400000);
      }

      const totalTasks = phase.tasks?.length || 0;
      const completedTasks = phase.tasks?.filter(t => t.status === "completed").length || 0;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // [LEVEL 1] PHASE (Màu đậm giữ nguyên để nổi bật)
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
        styles: { backgroundColor: "#10b981", progressColor: "#059669" } // Emerald đậm
      });

      const regularTasks = (phase.tasks?.filter(t => !t.is_shopping) || [])
          .sort((a, b) => new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime());
          
      const shoppingTasks = (phase.tasks?.filter(t => t.is_shopping) || [])
          .sort((a, b) => new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime());

      // [LEVEL 2] GROUP CÔNG VIỆC (Trong suốt)
      if (regularTasks.length > 0) {
        flatTasks.push({
          id: `${phase.id}-group-regular`,
          type: "task", 
          customLevel: "group",
          name: "CÔNG VIỆC CẦN LÀM",
          displayName: "CÔNG VIỆC CẦN LÀM",
          start: phaseStart,
          end: phaseEnd,
          progress: 0,
          styles: { 
            backgroundColor: "transparent", backgroundSelectedColor: "transparent", progressColor: "transparent" }
        });

        // [LEVEL 3] REGULAR TASKS
        regularTasks.forEach((todo) => {
          if (searchTerm && !todo.title.toLowerCase().includes(searchTerm.toLowerCase())) return;
          
          const deadlineDate = todo.deadline ? new Date(todo.deadline) : new Date();
          // Đảm bảo start không lớn hơn end
          const taskStart = deadlineDate.getTime() > phaseStart.getTime() ? phaseStart : new Date(deadlineDate.getTime() - 86400000);
          
          // --- LOGIC MÀU SẮC MỚI ---
          const isDoneOrCancelled = todo.status === "completed" || todo.status === "cancelled";
          // Kiểm tra quá hạn: Chưa xong VÀ deadline nhỏ hơn hiện tại (trừ trường hợp deadline là hôm nay)
          const isOverdue = !isDoneOrCancelled && deadlineDate < now && deadlineDate.toDateString() !== now.toDateString();

          let taskStyles = {
              backgroundColor: "#bfdbfe", // Pastel Blue nhạt (Mặc định)
              progressColor: "#60a5fa"    // Blue đậm hơn chút cho phần progress
          };

          if (isDoneOrCancelled) {
              taskStyles = {
                  backgroundColor: "#94a3b8", // Xám tối (Muted Slate)
                  progressColor: "#64748b"
              };
          } else if (isOverdue) {
              taskStyles = {
                  backgroundColor: "#fecdd3", // Pastel Đỏ nhẹ (Rose)
                  progressColor: "#fb7185"
              };
          }
          // -------------------------

          flatTasks.push({
            id: todo.id,
            type: "task",
            customLevel: "todo",
            name: todo.title,
            start: taskStart,
            end: deadlineDate,
            progress: isDoneOrCancelled ? 100 : todo.done_percentage || 0,
            rawTodo: todo,
            styles: taskStyles, 
          });
        });
      }

      // [LEVEL 2] GROUP MUA SẮM (Trong suốt)
      if (shoppingTasks.length > 0) {
        flatTasks.push({
          id: `${phase.id}-group-shopping`,
          type: "task",
          customLevel: "group",
          name: "DANH SÁCH MUA SẮM",
          start: phaseStart,
          end: phaseEnd,
          progress: 0,
          styles: { backgroundColor: "transparent", backgroundSelectedColor: "transparent", progressColor: "transparent" }
        });

        // [LEVEL 3] SHOPPING TASKS
        shoppingTasks.forEach((todo) => {
          if (searchTerm && !todo.title.toLowerCase().includes(searchTerm.toLowerCase())) return;

          const deadlineDate = todo.deadline ? new Date(todo.deadline) : new Date();
          const taskStart = deadlineDate.getTime() > phaseStart.getTime() ? phaseStart : new Date(deadlineDate.getTime() - 86400000);

          // --- LOGIC MÀU SẮC MỚI (Tương tự nhưng màu mặc định là Vàng) ---
          const isDoneOrCancelled = todo.status === "completed" || todo.status === "cancelled";
          const isOverdue = !isDoneOrCancelled && deadlineDate < now && deadlineDate.toDateString() !== now.toDateString();

          let taskStyles = {
              backgroundColor: "#fde68a", // Pastel Vàng nhạt (Amber)
              progressColor: "#fbbf24"
          };

          if (isDoneOrCancelled) {
              taskStyles = {
                  backgroundColor: "#94a3b8", // Xám tối
                  progressColor: "#64748b"
              };
          } else if (isOverdue) {
              taskStyles = {
                  backgroundColor: "#fecdd3", // Pastel Đỏ nhẹ
                  progressColor: "#fb7185"
              };
          }
          // -------------------------

          flatTasks.push({
            id: todo.id,
            type: "task",
            customLevel: "todo",
            name: todo.title,
            start: taskStart,
            end: deadlineDate,
            progress: isDoneOrCancelled ? 100 : 10 ,
            rawTodo: todo,
            styles: taskStyles,
          });
        });
      }
    });

    return flatTasks;
  }, [overviewConfig, searchTerm]);

  const ganttViewMode = useMemo(() => {
    switch (currentView) {
      case "day":
        return ViewMode.Day;
      case "week":
        return ViewMode.Week;
      case "month":
        return ViewMode.Month;
      default:
        return ViewMode.Day;
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
    return (
      <div className="p-10 text-center text-muted-foreground font-medium">
        No tasks available to show on Timeline.
      </div>
    );
    return (
      <div className="p-10 text-center text-muted-foreground font-medium">
        No tasks available to show on Timeline.
      </div>
    );
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
              rowHeight={40}
              columnWidth={ganttViewMode === ViewMode.Day ? 60 : 150}
              TaskListHeader={CustomTaskListHeader}
              TaskListTable={CustomTaskListTable}
              TooltipContent={CustomTooltip}
              barCornerRadius={8}
              barFill={70}
              todayColor="rgba(59, 130, 246)"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
