import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useMemo, useState } from "react";
import { X } from "lucide-react"; // Import icon nút đóng
import "./calendarWidget.css";
import type { FullConfigData } from "../../../pages/Overview";
import type { TodoItem } from "../../../types/todo.types"; // Thêm import type TodoItem

const CalendarWidget = ({ tasks: configs }: { tasks: FullConfigData[] }) => {
  const [selectedTask, setSelectedTask] = useState<{
    task: TodoItem;
    configName: string;
  } | null>(null);

  const events = useMemo(() => {
    return configs.flatMap((config) =>
      config.tasks.map((task) => {
        const getEventColor = () => {
          if (task.status === "completed") return "#10b981";
          switch (task.priority) {
            case "urgent":
              return "#ef4444";
            case "high":
              return "#f59e0b";
            case "medium":
              return "#3b82f6";
            case "low":
              return "#94a3b8";
            default:
              return "#64748b";
          }
        };

        return {
          id: task.id,
          title: task.title,
          start: task.deadline,
          display: "dot",
          color: getEventColor(),
          extendedProps: {
            task: task, // Truyền toàn bộ dữ liệu task vào extendedProps để hiển thị ở modal
            configName: config.name,
          },
        };
      }),
    );
  }, [configs]);

  return (
    <>
      <div className="p-4 bg-white rounded-2xl shadow-xl max-w-sm relative">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "title",
            center: "",
            right: "prev,next",
          }}
          events={events}
          dayHeaderFormat={{ weekday: "short" }}
          titleFormat={{ month: "short", year: "numeric" }}
          height="auto"
          fixedWeekCount={false}
          eventMouseEnter={(info) => {
            info.el.title = `${info.event.title} (${info.event.extendedProps.task.priority})`;
          }}
          // Bắt sự kiện click vào task trên lịch
          eventClick={(info) => {
            setSelectedTask({
              task: info.event.extendedProps.task,
              configName: info.event.extendedProps.configName,
            });
          }}
        />
      </div>

      {/* Modal Hiển thị chi tiết Task */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[400px] shadow-xl animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800 leading-tight">
                  {selectedTask.task.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Thuộc sự kiện: <span className="text-slate-600">{selectedTask.configName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Nội dung chi tiết */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl">
                {/* Trạng thái */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Status
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${
                      selectedTask.task.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {selectedTask.task.status}
                  </span>
                </div>

                {/* Mức độ ưu tiên */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Priority
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${
                      {
                        low: "bg-green-100 text-green-600",
                        medium: "bg-yellow-100 text-yellow-600",
                        high: "bg-red-100 text-red-600",
                        urgent: "bg-purple-100 text-purple-600",
                      }[selectedTask.task.priority || "medium"]
                    }`}
                  >
                    {selectedTask.task.priority}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Deadline
                </span>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(selectedTask.task.deadline).toLocaleString("vi-VN", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              {/* Thông tin Shopping (Nếu có) */}
              {selectedTask.task.is_shopping && (
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                      Shopping Task
                    </span>
                    {selectedTask.task.purchased && (
                      <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                        Purchased
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Số lượng: <strong className="text-slate-700">{selectedTask.task.quantity || 1}</strong></span>
                    {selectedTask.task.estimated_price && (
                      <span className="text-slate-500">Dự kiến: <strong className="text-slate-700">{selectedTask.task.estimated_price.toLocaleString()} đ</strong></span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
               <button
                  onClick={() => setSelectedTask(null)}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all text-sm"
                >
                  Đóng
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarWidget;