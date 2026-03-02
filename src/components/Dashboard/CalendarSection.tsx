import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Calendar } from "lucide-react";
import apiClient from "../../services/apiClient";
import { useAppStore } from "../../stores/useAppStore";

// --- Types & Interfaces ---
type EventPriority = "high" | "medium" | "low";

interface CalendarEvent {
  date: number;
  month: number;
  dayName: string;
  monthLabel: string;
  events: {
    title: string;
    categoryId?: string;
    categoryName?: string;
    priority: EventPriority;
    completed: boolean;
    todoId: string;
    isShopping: boolean;
    estimatedPrice?: number;
    subtasksCount?: number;
  }[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const CalendarSection = () => {
  const configId = useAppStore((state) => state.configId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Helpers ---
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const normalizePriority = (priority?: string): EventPriority => {
    if (priority === "high" || priority === "medium" || priority === "low")
      return priority;
    return "medium";
  };

  // --- Logic: Toggle Task Completion ---
  const handleToggleCompletion = async (
    todoId: string,
    currentCompleted: boolean,
    eventIndex: number,
    dayIndex: number,
  ) => {
    try {
      const newStatus = currentCompleted ? "pending" : "completed";
      await apiClient.todos.update(todoId, { status: newStatus });

      setEvents((prevEvents) => {
        const updated = [...prevEvents];
        const targetDay = { ...updated[dayIndex] };
        const targetEvents = [...targetDay.events];

        targetEvents[eventIndex] = {
          ...targetEvents[eventIndex],
          completed: newStatus === "completed",
        };

        targetDay.events = targetEvents;
        updated[dayIndex] = targetDay;
        return updated;
      });
    } catch (err) {
      console.error("Failed to update task completion:", err);
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!configId) {
        setEvents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // We only fetch Todos and Categories now; Transactions removed for redundancy
        const [todoItems, categoriesData] = await Promise.all([
          apiClient.todos.getAll({ tetConfigId: configId }),
          apiClient.categories.getByTetConfig(configId),
        ]);

        const categoriesById = new Map(
          categoriesData.map((c) => [String(c.id), c.name]),
        );
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const groupedByDate = new Map<string, CalendarEvent>();

        todoItems
          .filter((item) => {
            if (!item.deadline) return false;
            const itemDate = new Date(item.deadline);
            return (
              itemDate.getFullYear() === year && itemDate.getMonth() === month
            );
          })
          .forEach((item) => {
            const itemDate = new Date(item.deadline!);
            const key = formatDateKey(itemDate);

            if (!groupedByDate.has(key)) {
              groupedByDate.set(key, {
                date: itemDate.getDate(),
                month: itemDate.getMonth() + 1,
                dayName: itemDate
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .toUpperCase(),
                monthLabel: itemDate
                  .toLocaleDateString("en-US", { month: "short" })
                  .toUpperCase(),
                events: [],
              });
            }

            const day = groupedByDate.get(key)!;
            day.events.push({
              todoId: item.id,
              title: item.title,
              priority: normalizePriority(item.priority),
              completed: item.status === "completed",
              categoryName:
                item.category?.name ||
                categoriesById.get(String(item.category)),
              isShopping: item.is_shopping,
              estimatedPrice: item.estimated_price,
              subtasksCount: item.subtasks
                ? Object.keys(item.subtasks).length
                : 0,
            });
          });

        const sorted = Array.from(groupedByDate.values()).sort(
          (a, b) => a.date - b.date,
        );
        setEvents(sorted);
      } catch (err) {
        setError("Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [configId, currentDate]);

  // --- Styling Helpers ---
  const getPriorityStyles = (priority: string, completed: boolean) => {
    if (completed) return "bg-gray-100 border-gray-200 opacity-60";
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-100";
      case "medium":
        return "bg-amber-50 border-amber-100";
      case "low":
        return "bg-green-50 border-green-100";
      default:
        return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full max-w-lg">
      {/* 1. Header: Navigation & Month Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            Timeline
          </h3>
          <p className="text-xs text-muted-foreground">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4 h-[350px] overflow-y-auto pr-2">
        {loading && (
          <p className="text-center text-sm py-10">Loading tasks...</p>
        )}
        {!loading && events.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No deadlines this month.
          </p>
        )}

        {events.map((day, dayIdx) => (
          <div
            key={dayIdx}
            className="relative pl-4 border-l-2 border-gray-100 pb-2"
          >
            {/* 2. Day Label */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold">{day.date}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase">
                {day.dayName}
              </span>
            </div>

            {/* 3. Task Cards */}
            <div className="space-y-2">
              {day.events.map((event, eventIdx) => (
                <div
                  key={event.todoId}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${getPriorityStyles(event.priority, event.completed)}`}
                >
                  {/* Custom Checkbox */}
                  <button
                    onClick={() =>
                      handleToggleCompletion(
                        event.todoId,
                        event.completed,
                        eventIdx,
                        dayIdx,
                      )
                    }
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      event.completed
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {event.completed && (
                      <Check size={12} className="text-white" strokeWidth={3} />
                    )}
                  </button>

                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold transition-all ${event.completed ? "text-gray-400 line-through" : "text-gray-800"}`}
                    >
                      {event.title}
                    </p>

                    {/* Subtitle: Subtasks or Price */}
                    {event.isShopping && event.estimatedPrice !== undefined ? (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Estimated price: {formatCurrency(event.estimatedPrice)}
                      </p>
                    ) : event.subtasksCount !== undefined &&
                      event.subtasksCount > 0 ? (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {event.subtasksCount} subtask
                        {event.subtasksCount !== 1 ? "s" : ""}
                      </p>
                    ) : null}

                    {/* Badges Section */}
                    <div className="flex gap-2 mt-1.5">
                      {event.categoryName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 border border-black/5 text-gray-600">
                          {event.categoryName}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          event.completed
                            ? "bg-gray-200 text-gray-500"
                            : "bg-white/50 text-gray-700"
                        }`}
                      >
                        {event.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSection;
