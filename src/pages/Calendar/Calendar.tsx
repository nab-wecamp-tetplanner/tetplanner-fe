import React, { useState, useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { format } from "date-fns";
import { 
  Trash2, 
  X, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon,
} from "lucide-react";
import "./calendar.css";
import TaskToolbar, { type ViewType } from "../../components/Timeline/Toolbar";
import type { OverviewConfig } from "../../types/overview.types";
import type { TodoItem } from "../../types/todo.types";
import apiClient from "../../services/apiClient";

// Định nghĩa một type mở rộng nhẹ để lưu thêm tên Phase dùng cho giao diện
interface FlattenedTodo extends TodoItem {
  phaseName: string;
}

export default function CalendarPage({
  tasks: overviewConfig,
  onUpdateTask
}: {
  tasks?: OverviewConfig;
  setTasks: Dispatch<SetStateAction<OverviewConfig | undefined>>;
  onUpdateTask: (id: string, updatedTask: TodoItem) => Promise<void>;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FlattenedTodo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("month");

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
          phaseName: phase.name, // Đính kèm tên phase để hiển thị
        });
      });
    });
    return flat;
  }, [overviewConfig]);

  // 2. Lọc theo thanh tìm kiếm
  const searchedTasks = useMemo(() => {
    if (!searchTerm) return allTasks;
    return allTasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allTasks, searchTerm]);

  // 3. Lọc theo ngày được click (Bên cột phải)
  const filteredTasks = useMemo(() => {
    return searchedTasks.filter((t) => {
      if (!t.deadline) return false;
      const taskDateStr = format(new Date(t.deadline), "yyyy-MM-dd");
      const selectedDateStr = format(new Date(selectedDate), "yyyy-MM-dd");
      return taskDateStr === selectedDateStr;
    });
  }, [searchedTasks, selectedDate]);

  // 4. Map dữ liệu vào giao diện của FullCalendar
  const calendarEvents = useMemo(() => {
    return searchedTasks.map((t) => {
      let color = "#3b82f6"; // planner-blue (Mặc định)
      if (t.status === "completed") color = "#10b981"; // planner-green
      else if (t.priority === "high" || t.priority === "urgent") color = "#ec4899"; // planner-pink

      return {
        id: t.id,
        title: t.title,
        start: t.deadline, // Dùng deadline làm mốc hiển thị trên lịch
        color: color,
        extendedProps: { raw: t } // Giữ lại data gốc nếu cần dùng cho các sự kiện click
      };
    });
  }, [searchedTasks]);

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
      const fcView = view === "day" ? "timeGridDay" : view === "week" ? "timeGridWeek" : "dayGridMonth";
      calendarApi.changeView(fcView);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiClient.todos.delete(id);
      // Refresh lại data (giả sử setTasks sẽ trigger re-render từ component cha)
      // Nếu không, bạn cần gọi lại hàm fetch data ở đây
      alert("Deleted successfully!");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // Nối thẳng hàm Check/Uncheck vào API thật
  const toggleStatus = async (task: FlattenedTodo) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const updatedTask: TodoItem = { ...task, status: newStatus };
    
    // Gọi hàm update prop truyền từ cha xuống
    await onUpdateTask(task.id, updatedTask);
  };


  const handleSaveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get("title") as string,
      priority: formData.get("priority") as any,
      status: formData.get("status") as any,
      deadline: formData.get("deadline") as string,
      timeline_phase_id: formData.get("timeline_phase_id") as string,
      tet_config_id: overviewConfig?.id || "", 
      category_id: editingTask?.category.id || overviewConfig?.phases[0]?.tasks?.[0]?.category.id || "", 
      is_shopping: editingTask?.is_shopping || false,
    };

    try {
      if (editingTask) {
        await apiClient.todos.update(editingTask.id, payload);
      } else {
        await apiClient.todos.create(payload as any);
      }
      closeModal();
      // Reload lại data hoặc gọi callback refresh
      window.location.reload(); 
    } catch (error) {
      console.error("Submit failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (task: FlattenedTodo) => {
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
    return <div className="p-10 text-center text-muted-foreground">Loading calendar...</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 ">
        
        <TaskToolbar 
          activeView={currentView}
          onViewChange={handleViewChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddClick={() => setIsModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI: CALENDAR */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 overflow-hidden">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
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
                editable={false} // Tắt kéo thả của FullCalendar vì ta dùng onUpdateTask riêng
                selectable={true}
                dayMaxEvents={3}
              />
            </div>
          </div>

          {/* CỘT PHẢI: TASK LIST CHO NGÀY ĐANG CHỌN */}
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

            <div className="divide-y divide-border overflow-y-auto max-h-[450px] custom-scrollbar">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-foreground font-medium mb-1">
                    {searchTerm ? "No matching tasks" : "No tasks assigned"}
                  </p>
                  <p className="text-muted-foreground text-sm">Enjoy your free time!</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === "completed";
                  return (
                    <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group">
                      {/* Nút Check/Uncheck đã kết nối API */}
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
                        <span className={`font-medium text-sm block truncate ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            {task.phaseName} {/* Hiển thị tên Phase thực tế */}
                          </span>
                          <span className="w-1 h-1 bg-border rounded-full" />
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${
                            task.priority === "urgent" || task.priority === "high" ? "text-planner-pink" : 
                            task.priority === "medium" ? "text-planner-blue" : "text-planner-amber"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-planner-blue transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
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

      {/* MODAL (Giữ nguyên cấu trúc UI của bạn) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveTask} className="bg-card p-6 rounded-2xl w-full max-w-md border border-border shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {editingTask ? "Update Task" : "Create New Task"}
              </h3>
              <button type="button" onClick={closeModal} className="p-1 hover:bg-muted rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Title</label>
                <input 
                  name="title" 
                  defaultValue={editingTask?.title} 
                  required 
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-planner-blue outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Deadline */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Deadline</label>
                  <input 
                    name="deadline" 
                    type="date"
                    defaultValue={editingTask?.deadline ? format(new Date(editingTask.deadline), "yyyy-MM-dd") : format(selectedDate, "yyyy-MM-dd")} 
                    required 
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm" 
                  />
                </div>
                {/* Priority */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Priority</label>
                  <select name="priority" defaultValue={editingTask?.priority || "medium"} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Phase Selection */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Timeline Phase</label>
                <select 
                  name="timeline_phase_id" 
                  defaultValue={editingTask?.timeline_phase.id || overviewConfig?.phases[0]?.id} 
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  {overviewConfig?.phases.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Status</label>
                <select name="status" defaultValue={editingTask?.status || "pending"} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-3 mt-4 bg-planner-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}