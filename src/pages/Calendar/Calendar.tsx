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
  Plus,
} from "lucide-react";
import "./calendar.css";
import TaskToolbar, { type ViewType } from "../../components/Timeline/Toolbar";
import type { OverviewConfig } from "../../types/overview.types";
import type { TaskCreateRequest, TodoItem } from "../../types/todo.types";
import type { CategoryResponse } from "../../types/categories.type";
import CalendarModal from "../../components/CalendarModal/Calendarmodal";

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
  overviewConfig: OverviewConfig | undefined;
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
  // DATA FLATTENING
  // ==========================================
  const allTasks = useMemo(() => {
    if (!overviewConfig || !overviewConfig.phases) return [];
    const flat: FlattenedTodo[] = [];
    overviewConfig.phases.forEach((phase) => {
      phase.tasks?.forEach((todo) => {
        flat.push({ ...todo, phaseName: phase.name });
      });
    });
    return flat;
  }, [overviewConfig]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (!t.deadline) return false;
      return (
        format(new Date(t.deadline), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
      );
    });
  }, [allTasks, selectedDate]);

  const calendarEvents = useMemo(() => {
    return allTasks.map((t) => {
      let taskClass = "task-blue"; // Mặc định (Medium)

      if (t.status === "completed") {
        taskClass = "task-green"; // Xong rồi -> Xanh lá
      } else if (t.priority === "urgent" || t.priority === "high") {
        taskClass = "task-rose"; // Gấp -> Hồng/Đỏ
      } else if (t.priority === "low") {
        taskClass = "task-slate"; // Bình thường -> Xám slate
      }

      return {
        id: t.id,
        title: t.title,
        start: t.deadline,
        className: taskClass, // Gửi class này qua CSS
        extendedProps: { raw: t },
      };
    });
  }, [allTasks]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleDateClick = (arg: any) => {
    setSelectedDate(new Date(arg.dateStr));
    document
      .querySelectorAll(".fc-daygrid-day")
      .forEach((el) => el.classList.remove("selected-day-active"));
    arg.dayEl.classList.add("selected-day-active");
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(
        view === "day"
          ? "timeGridDay"
          : view === "week"
            ? "timeGridWeek"
            : "dayGridMonth",
      );
    }
  };

  const toggleStatus = async (task: FlattenedTodo) => {
    await onUpdateTask(task.id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
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

  return (
    <div className="min-h-screen transition-all duration-500">
      <main className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. TOOLBAR: Luôn hiện để tạo cảm giác App đã sẵn sàng */}
        <TaskToolbar
          activeView={currentView}
          onViewChange={handleViewChange}
          onAddClick={() => {
            setIsNew(true);
            setIsModalOpen(true);
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
          {/* 2. CỘT TRÁI: CALENDAR SECTION */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 min-h-[580px] relative overflow-hidden">
              {!overviewConfig ? (
                /* SKELETON LỒNG TRONG UI */
                <div className="animate-pulse space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-slate-100 rounded-xl" />
                    <div className="flex gap-2">
                      <div className="h-9 w-24 bg-slate-50 rounded-lg" />
                      <div className="h-9 w-10 bg-slate-50 rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-7 grid-rows-5 border border-slate-50 rounded-2xl h-[450px] overflow-hidden">
                    {[...Array(35)].map((_, i) => (
                      <div
                        key={i}
                        className="border-[0.5px] border-slate-50/50 p-2 bg-slate-50/10"
                      >
                        <div className="h-3 w-3 bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ACTUAL CALENDAR */
                <div className="animate-in fade-in zoom-in-95 duration-700">
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[
                      dayGridPlugin,
                      timeGridPlugin,
                      listPlugin,
                      interactionPlugin,
                    ]}
                    initialView="dayGridMonth"
                    displayEventTime={false}
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
                    dayMaxEvents={2}
                    fixedWeekCount={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. CỘT PHẢI: TASK SIDEBAR */}
          <div className="lg:col-span-4 sticky top-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[580px]">
              <div className="p-7 border-b border-slate-50 bg-slate-50/30">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Tasks schedule
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                  {format(selectedDate, "eeee, dd MMM yyyy")}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {!overviewConfig ? (
                  /* SKELETON TASK LIST */
                  [...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-5 py-5 animate-pulse"
                    >
                      <div className="h-10 w-10 bg-slate-100 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-slate-100 rounded" />
                        <div className="h-3 w-1/2 bg-slate-50 rounded" />
                      </div>
                    </div>
                  ))
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-24 px-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">
                      No tasks for this day
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTasks.map((task) => {
                      const isDone = task.status === "completed";

                      // Xác định màu dot dựa trên Priority/Status (Y hệt bên Grid)
                      let dotColorClass = "bg-blue-500"; // Default Medium
                      if (isDone) {
                        dotColorClass = "bg-emerald-500"; // Completed
                      } else if (
                        task.priority === "urgent" ||
                        task.priority === "high"
                      ) {
                        dotColorClass = "bg-rose-500"; // High Priority
                      } else if (task.priority === "low") {
                        dotColorClass = "bg-slate-400"; // Low Priority
                      }
                      return (
                        <div
                          key={task.id}
                          className="group flex items-center gap-4 px-5 py-4 hover:bg-slate-50 rounded-[1.5rem] transition-all duration-300 animate-in slide-in-from-right-4"
                        >
                          <button
                            onClick={() => toggleStatus(task)}
                            className={`shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                              isDone
                                ? "bg-emerald-50 text-emerald-500"
                                : "bg-white text-slate-300 border border-slate-100 hover:border-blue-200 hover:text-blue-500"
                            }`}
                          >
                            <CheckCircle2
                              className={`w-5 h-5 ${isDone ? "fill-emerald-50" : ""}`}
                            />
                          </button>

                          <div
                            className="flex-1 min-w-0"
                            onClick={() => openEditModal(task)}
                          >
                            <span
                              className={`font-bold text-sm block truncate transition-all ${isDone ? "text-slate-300 line-through" : "text-slate-700"}`}
                            >
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {/* ĐỒNG BỘ DOT Ở ĐÂY: Dùng dotColorClass Nhi vừa định nghĩa */}
                              <div
                                className={`w-2 h-2 rounded-full shadow-sm ${dotColorClass}`}
                              />

                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">
                                {task.phaseName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-500 hover:shadow-sm transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-rose-500 hover:shadow-sm transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Add Button at bottom of sidebar */}
              {overviewConfig && (
                <div className="p-4 bg-slate-50/50 mt-auto">
                  <button
                    onClick={() => {
                      setIsNew(true);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-3 bg-white border border-slate-200 border-dashed rounded-2xl text-slate-500 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-blue-300 hover:text-blue-500 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Quick Add Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <CalendarModal
        is_new={isNew}
        isOpen={isModalOpen}
        onClose={closeModal}
        editingTask={editingTask}
        selectedDate={selectedDate}
        phases={overviewConfig?.phases || []}
        categories={categories}
        onUpdateTask={onUpdateTask}
        onCreateTask={onCreateTask}
      />
    </div>
  );
}
