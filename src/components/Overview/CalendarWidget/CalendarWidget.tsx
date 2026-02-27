import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import "./calendarWidget.css";
import type { TodoItem } from "../../../types/todo.types";
import { useAppStore } from "../../../stores/useAppStore";
import { useLoading } from "../../../contexts/LoadingContext";
import apiClient from "../../../services/apiClient";


const CalendarWidget = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayTasks, setDayTasks] = useState<TodoItem[]>([]);
  const [tasks, setTasks] = useState<TodoItem[]>([]);
  const {hideLoading} = useLoading();
  const configId = useAppStore((state) => state.configId);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!configId) return;
        // showLoading();
        const data = await apiClient.todos.getAll({
          tetConfigId: configId
        });
        setTasks(data);
      } catch (e) { 
        throw new Error("Error in fetching data");
      } 
      finally{
        hideLoading();
      }
    }
    fetchTasks();
  }, [configId])

  // Giả sử đây là danh sách task từ project Travello hoặc Tết Planner của Ngọc
  const events = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.deadline?.split("T")[0],
      extendedProps: { ...task },
      backgroundColor: task.priority === 'urgent' ? '#fee2e2' : task.priority === 'high' ? '#ffedd5' : '#dcfce7',
      borderColor: task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f59e0b' : '#10b981',
    }));
  }, [tasks]);

  useEffect(() => {
    console.log("Events: ", events)
  }, [events])

  const handleDateClick = (arg: { dateStr: string }) => {
    const tasksInDay = events.filter(e => e.start === arg.dateStr).map(e => e.extendedProps);
    setSelectedDate(arg.dateStr);
    setDayTasks(tasksInDay as TodoItem[]);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: "title", right: "prev,next" }}
          events={events}
          dateClick={handleDateClick}
          dayMaxEvents={2} // Nếu > 2 task sẽ hiện "+ more" thay vì làm nát layout
          moreLinkContent={(args) => <span className="text-[9px] font-bold text-slate-400">+{args.num} more</span>}
          eventDidMount={(info) => {
            // Inject CSS variables để thanh màu đẹp hơn
            info.el.style.setProperty('--event-bg', info.event.backgroundColor);
            info.el.style.setProperty('--event-border', info.event.borderColor);
          }}
          height="auto"
        />
      </div>

      {/* Modal Detail khi click vào ngày */}
      {selectedDate && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[320px] shadow-2xl animate-in zoom-in duration-150">
            <div className="p-4 flex justify-between items-center border-b border-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Date {selectedDate}</h3>
              <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={16}/></button>
            </div>
            <div className="p-3 space-y-2">
              {dayTasks.length > 0 ? dayTasks.map(t => (
                <div key={t.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 ">
                  <p className="text-xs font-bold text-slate-700">{t.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{t.priority}</p>
                </div>
              )) : <p className="text-center py-4 text-xs text-slate-400">No task!</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;