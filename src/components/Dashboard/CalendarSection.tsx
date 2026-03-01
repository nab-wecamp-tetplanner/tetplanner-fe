import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Calendar } from "lucide-react";
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
    type: "task" | "shopping";
    title: string;
    categoryId?: string;
    categoryName?: string;
    color: string;
    priority?: EventPriority;
    completed?: boolean;
    cost?: number;
    todoId?: string;
  }[];
}

type TodoItemWithCategoryVariants = TodoItem & {
  category_id?: string;
  category?: {
    id?: string;
    name?: string;
  } | null;
};

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

  const resolveCategoryFromTodo = (
    item: TodoItem,
    categoriesById: Map<string, string>,
  ) => {
    const todoItem = item as TodoItemWithCategoryVariants;
    const categoryId = todoItem.category?.id ?? todoItem.category_id;
    const embeddedCategoryName = todoItem.category?.name;
    const categoryNameFromMap = categoryId
      ? categoriesById.get(String(categoryId))
      : undefined;

    return {
      categoryId: categoryId ? String(categoryId) : undefined,
      categoryName:
        embeddedCategoryName?.trim() ||
        categoryNameFromMap?.trim() ||
        undefined,
    };
  };

  const handleToggleCompletion = async (
    todoId: string,
    currentCompleted: boolean,
    eventIndex: number,
    dayIndex: number,
  ) => {
    try {
      const newStatus = currentCompleted ? "pending" : "completed";
      await apiClient.todos.update(todoId, { status: newStatus });

      // Update local state
      setEvents((prevEvents) => {
        const updated = [...prevEvents];
        updated[dayIndex] = {
          ...updated[dayIndex],
          events: [...updated[dayIndex].events],
        };
        updated[dayIndex].events[eventIndex] = {
          ...updated[dayIndex].events[eventIndex],
          completed: newStatus === "completed",
        };
        return updated;
      });
    } catch (err) {
      console.error("Failed to update task completion:", err);
    }
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
        const [todoItems, transactions, categoriesData] = await Promise.all([
          apiClient.todos.getAll({ tetConfigId: configId }),
          apiClient.transactions.getByConfig(configId),
          apiClient.categories.getByTetConfig(configId),
        ]);

        const categoriesById = new Map(
          categoriesData.map((category) => [
            String(category.id),
            category.name,
          ]),
        );

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
            const { categoryId, categoryName } = resolveCategoryFromTodo(
              item,
              categoriesById,
            );

            day.events.push({
              type: item.is_shopping ? "shopping" : "task",
              title: item.title,
              categoryId,
              categoryName,
              color: item.is_shopping ? "#1ea7ff" : "#5051f9",
              priority: normalizePriority(item.priority),
              completed: item.status === "completed",
              cost: item.is_shopping
                ? (item.estimated_price || 0) * (item.quantity || 1)
                : undefined,
              todoId: item.id,
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
                {dayEvents.events.map((event, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        event.completed
                          ? "bg-gray-100 border-gray-300 opacity-60"
                          : getPriorityColor(event.priority)
                      }`}
                    >
                      {/* Checkbox or Icon */}
                      <div className="shrink-0 mt-0.5">
                        <button
                          type="button"
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                            event.completed
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-400 hover:border-blue-500"
                          }`}
                          onClick={() => {
                            const dayIndex = events.indexOf(dayEvents);
                            handleToggleCompletion(
                              event.todoId!,
                              event.completed!,
                              idx,
                              dayIndex,
                            );
                          }}
                          aria-label={
                            event.completed
                              ? "Mark as pending"
                              : "Mark as completed"
                          }
                        >
                          {event.completed && (
                            <Check size={14} className="text-white" />
                          )}
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold ${
                                event.completed
                                  ? "text-gray-500 line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {event.title}
                            </p>
                            {/* Info line: estimated price or task details */}
                            {event.type === "shopping" && event.cost && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ₫{(event.cost / 1000000).toFixed(1)}M
                              </p>
                            )}
                          </div>

                          {/* Badges on the right */}
                          <div className="shrink-0 flex flex-col gap-1">
                            {/* Priority Badge */}
                            {event.priority && (
                              <span
                                className={`inline-block px-2 py-1 text-xs font-medium rounded text-center ${
                                  event.completed
                                    ? "bg-gray-300 text-gray-600"
                                    : getPriorityBadge(event.priority)
                                }`}
                              >
                                {event.priority.charAt(0).toUpperCase() +
                                  event.priority.slice(1)}
                              </span>
                            )}

                            {/* Category Badge */}
                            {event.categoryName && (
                              <span
                                className={`inline-block px-2 py-1 text-xs font-medium rounded text-center ${
                                  event.completed
                                    ? "bg-gray-300 text-gray-600"
                                    : getPriorityBadge(event.priority)
                                }`}
                              >
                                {event.categoryName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarSection;
