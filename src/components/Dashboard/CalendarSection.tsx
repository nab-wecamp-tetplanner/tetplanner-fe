import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShoppingCart,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import { useAppStore } from "../../stores/useAppStore";
import type { TodoItem } from "../../types/todo.types";
import type { Transaction } from "../../types/transaction.types";

type EventPriority = "high" | "medium" | "low";

interface CalendarEvent {
  date: number;
  month: number;
  day: string;
  dayName: string;
  monthLabel: string;
  events: {
    type: "all-day" | "timed" | "task" | "shopping";
    title: string;
    time?: string;
    location?: string;
    color: string;
    priority?: EventPriority;
    completed?: boolean;
    cost?: number;
  }[];
}

const CalendarSection = () => {
  const configId = useAppStore((state) => state.configId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const normalizePriority = (
    priority?: TodoItem["priority"],
  ): EventPriority => {
    if (priority === "high" || priority === "medium" || priority === "low") {
      return priority;
    }
    return "high";
  };

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
        const [todoItems, transactions] = await Promise.all([
          apiClient.todos.getAll({ tetConfigId: configId }),
          apiClient.transactions.getByConfig(configId),
        ]);

        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const groupedByDate = new Map<string, CalendarEvent>();

        const getOrCreateDay = (date: Date): CalendarEvent => {
          const key = formatDateKey(date);
          const existing = groupedByDate.get(key);
          if (existing) {
            return existing;
          }

          const created: CalendarEvent = {
            date: date.getDate(),
            month: date.getMonth() + 1,
            day: String(date.getDate()),
            dayName: date
              .toLocaleDateString("en-US", { weekday: "short" })
              .toUpperCase(),
            monthLabel: date
              .toLocaleDateString("en-US", { month: "short" })
              .toUpperCase(),
            events: [],
          };
          groupedByDate.set(key, created);
          return created;
        };

        todoItems
          .filter((item) => {
            if (!item.deadline) {
              return false;
            }
            const itemDate = new Date(item.deadline);
            return (
              itemDate.getFullYear() === year && itemDate.getMonth() === month
            );
          })
          .forEach((item) => {
            const itemDate = new Date(item.deadline);
            const day = getOrCreateDay(itemDate);

            day.events.push({
              type: item.is_shopping ? "shopping" : "task",
              title: item.title,
              time: itemDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              color: item.is_shopping ? "#1ea7ff" : "#5051f9",
              priority: normalizePriority(item.priority),
              completed: item.status === "completed",
              cost: item.is_shopping
                ? (item.estimated_price || 0) * (item.quantity || 1)
                : undefined,
            });
          });

        transactions
          .filter((transaction: Transaction) => {
            const transactionDate = new Date(transaction.transaction_date);
            return (
              transaction.type === "expense" &&
              transactionDate.getFullYear() === year &&
              transactionDate.getMonth() === month
            );
          })
          .forEach((transaction: Transaction) => {
            const transactionDate = new Date(transaction.transaction_date);
            const day = getOrCreateDay(transactionDate);

            day.events.push({
              type: "shopping",
              title: transaction.note || "Expense",
              time: transactionDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              color: "#8b5cf6",
              cost: Number(transaction.amount) || 0,
            });
          });

        const sorted = Array.from(groupedByDate.values()).sort((a, b) => {
          if (a.month === b.month) {
            return a.date - b.date;
          }
          return a.month - b.month;
        });

        setEvents(sorted);
      } catch (fetchError) {
        setError("Failed to load timeline data");
        setEvents([]);
        console.error("Failed to load calendar data:", fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [configId, currentDate]);

  const getEventIcon = (type: string, priority?: string) => {
    switch (type) {
      case "shopping":
        return <ShoppingCart size={15} />;
      case "task":
        return priority === "high" ? (
          <AlertCircle size={15} />
        ) : (
          <CheckCircle2 size={15} />
        );
      default:
        return <Clock size={15} />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-amber-50 border-amber-200";
      case "low":
        return "bg-green-50 border-green-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden w-full max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar size={18} />
            Timeline View
          </h3>
          <p className="text-xs text-muted-foreground">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1,
                  1,
                ),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  1,
                ),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-100 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading timeline data...
          </p>
        )}

        {!loading && error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No events for this month.
          </p>
        )}

        {events.map((dayEvents) => {
          const progressEvents = dayEvents.events.filter(
            (e) =>
              (e.type === "task" || e.type === "shopping") &&
              typeof e.completed === "boolean",
          );
          const completedProgressEvents = progressEvents.filter(
            (e) => e.completed,
          ).length;

          return (
            <div
              key={`${dayEvents.date}-${dayEvents.month}`}
              className="border rounded-xl p-4 transition-colors bg-gray-50 border-gray-200 hover:border-gray-300"
            >
              {/* Day Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-foreground">
                    {dayEvents.date}
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase">
                    {dayEvents.monthLabel}, {dayEvents.dayName}
                  </p>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Tasks
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {completedProgressEvents}/{progressEvents.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all bg-blue-500"
                    style={{
                      width: `${
                        progressEvents.length > 0
                          ? (completedProgressEvents / progressEvents.length) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Events */}
              <div className="space-y-2">
                {dayEvents.events.map((event, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${getPriorityColor(event.priority)}`}
                  >
                    {/* Icon */}
                    <div
                      className="shrink-0 mt-0.5 text-foreground"
                      style={{ color: event.color }}
                    >
                      {getEventIcon(event.type, event.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {event.title}
                          </p>
                          {event.time && (
                            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock size={12} />
                              {event.time}
                            </p>
                          )}
                        </div>
                        {event.type === "shopping" && event.cost && (
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-bold text-foreground">
                              ₫{(event.cost / 1000000).toFixed(1)}M
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Priority Badge */}
                      {event.priority && (
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(event.priority)}`}
                          >
                            {event.priority.charAt(0).toUpperCase() +
                              event.priority.slice(1)}{" "}
                            Priority
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarSection;
