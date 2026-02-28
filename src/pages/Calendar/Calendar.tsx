import {
  useState,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { format } from "date-fns";
import {
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import "./calendar.css";
import TaskToolbar, { type ViewType } from "../../components/Timeline/Toolbar";
import type { OverviewConfig } from "../../types/overview.types";
import type { TaskCreateRequest, TodoItem } from "../../types/todo.types";
// import apiClient from "../../services/apiClient";
import type { CategoryResponse } from "../../types/categories.type";
import CalendarModal from "../../components/CalendarModal/Calendarmodal"; // Import Modal mới

// Định nghĩa và export type mở rộng để dùng chung với Modal
export interface FlattenedTodo extends TodoItem {
  phaseName: string;
}

export default function CalendarPage({
  overviewConfig,
  categories,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
}: {
  overviewConfig: OverviewConfig;
  categories: CategoryResponse[];
  setTasks: Dispatch<SetStateAction<OverviewConfig | undefined>>;
  onUpdateTask: (id: string, updatedTask: any) => Promise<void>;
  onCreateTask: (newTask: TaskCreateRequest) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FlattenedTodo | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("month");
  const [isNew, setIsNew] = useState<boolean>(true);

  const calendarRef = useRef<FullCalendar>(null);

  // ==========================================
  // DATA FLATTENING & COMPUTATION
  // ==========================================

  // 1. Trải phẳng dữ liệu từ OverviewConfig
  const allTasks = useMemo(() => {
    if (!overviewConfig || !overviewConfig.phases) return [];

    const flat: FlattenedTodo[] = [];
    overviewConfig.phases.forEach((phase) => {
      phase.tasks?.forEach((todo) => {
        flat.push({
          ...todo,
          phaseName: phase.name,
        });
      });
    });
    return flat;
  }, [overviewConfig]);

  // 2. Lọc theo ngày được click (Bên cột phải) - Dùng trực tiếp allTasks thay vì searchedTasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (!t.deadline) return false;
      const taskDateStr = format(new Date(t.deadline), "yyyy-MM-dd");
      const selectedDateStr = format(new Date(selectedDate), "yyyy-MM-dd");
      return taskDateStr === selectedDateStr;
    });
  }, [allTasks, selectedDate]);

  // 3. Map dữ liệu vào giao diện của FullCalendar
  const calendarEvents = useMemo(() => {
    return allTasks.map((t) => {
      let color = "#3b82f6"; // planner-blue
      if (t.status === "completed") color = "#10b981"; // planner-green
      else if (t.priority === "high" || t.priority === "urgent")
        color = "#ec4899"; // planner-pink

      return {
        id: t.id,
        title: t.title,
        start: t.deadline,
        color: color,
        extendedProps: { raw: t },
      };
    });
  }, [allTasks]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleDateClick = (arg: any) => {
    setSelectedDate(new Date(arg.dateStr));
    const allDays = document.querySelectorAll(".fc-daygrid-day");
    allDays.forEach((el) => el.classList.remove("selected-day-active"));
    arg.dayEl.classList.add("selected-day-active");
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const fcView =
        view === "day"
          ? "timeGridDay"
          : view === "week"
            ? "timeGridWeek"
            : "dayGridMonth";
      calendarApi.changeView(fcView);
    }
  };

  const toggleStatus = async (task: FlattenedTodo) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const updatedTask = { status: newStatus };
    await onUpdateTask(task.id, updatedTask);
  };

  const openEditModal = (task: FlattenedTodo) => {
    setIsNew(false);
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (!overviewConfig) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 ">
        <TaskToolbar
          activeView={currentView}
          onViewChange={handleViewChange}
          onAddClick={() => setIsModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: CALENDAR */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 overflow-hidden">
              <FullCalendar
                ref={calendarRef}
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin,
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "title",
                  center: "",
                  right: "prev,next today",
                }}
                events={calendarEvents}
                dateClick={handleDateClick}
                height="auto"
                contentHeight={450}
                nowIndicator={true}
                editable={false}
                selectable={true}
                dayMaxEvents={3}
              />
            </div>
          </div>

          {/* CỘT PHẢI: TASK LIST */}
          <div className="lg:col-span-4 bg-card rounded-2xl border border-border shadow-sm overflow-hidden sticky top-6">
            <div className="font-semibold p-5 border-b border-border flex justify-between items-center bg-card">
              <div>
                <h2 className="text-xl text-foreground">Tasks schedule</h2>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(selectedDate, "dd MMM yyyy")}
                </p>
              </div>
            </div>

            <div className="divide-y divide-border overflow-y-auto custom-scrollbar">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-foreground font-medium mb-1">
                    No tasks assigned
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Enjoy your free time!
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === "completed";
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group"
                    >
                      <button
                        onClick={() => toggleStatus(task)}
                        className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                          isDone
                            ? "bg-planner-green-light text-planner-green"
                            : "bg-muted text-muted-foreground hover:bg-planner-green-light hover:text-planner-green"
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <span
                          className={`font-medium text-sm block truncate ${
                            isDone
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            {task.phaseName}
                          </span>
                          <span className="w-1 h-1 bg-border rounded-full" />
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide ${
                              task.priority === "urgent" ||
                              task.priority === "high"
                                ? "text-planner-pink"
                                : task.priority === "medium"
                                  ? "text-planner-blue"
                                  : "text-planner-amber"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1  group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-planner-blue transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-planner-pink transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Gọi Modal Component ở đây */}
      <CalendarModal
        is_new={isNew}
        isOpen={isModalOpen}
        onClose={closeModal}
        editingTask={editingTask}
        selectedDate={selectedDate}
        phases={overviewConfig.phases}
        categories={categories}
        onUpdateTask={onUpdateTask}
        onCreateTask={onCreateTask}
      />
    </div>
  );
}