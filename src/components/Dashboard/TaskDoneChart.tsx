import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../Dashboard/Card";
import apiClient from "../../services/apiClient";
import { useAppStore } from "../../stores/useAppStore";
import type { TodoItem } from "../../types/todo.types";

const CHART_LEGEND_ITEMS = [
  { color: "bg-green-500", label: "Tasks Done" },
  { color: "bg-blue-500", label: "Tasks Created" },
];

type TaskChartData = {
  week: string;
  tasksDone: number;
  tasksCreated: number;
};

const CHART_DAYS = 7;

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const toStartOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getRecentDays = () => {
  const today = toStartOfDay(new Date());
  return Array.from({ length: CHART_DAYS }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (CHART_DAYS - 1 - index));
    return date;
  });
};

const parseTaskDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : toStartOfDay(parsed);
};

const buildWeeklyTaskData = (tasks: TodoItem[]): TaskChartData[] => {
  const days = getRecentDays();
  const firstDay = days[0];

  const createdByDay = new Map<string, number>();
  const doneByDay = new Map<string, number>();

  tasks
    .filter((task) => !task.is_shopping)
    .forEach((task) => {
      const createdDate = parseTaskDate(task.created_at);
      const completedAt = (task as TodoItem & { completed_at?: string })
        .completed_at;
      const doneDate = parseTaskDate(
        task.status === "completed"
          ? completedAt || task.created_at
          : undefined,
      );

      if (createdDate) {
        if (createdDate >= firstDay) {
          const createdKey = getDateKey(createdDate);
          createdByDay.set(createdKey, (createdByDay.get(createdKey) || 0) + 1);
        }
      }

      if (doneDate) {
        if (doneDate >= firstDay) {
          const doneKey = getDateKey(doneDate);
          doneByDay.set(doneKey, (doneByDay.get(doneKey) || 0) + 1);
        }
      }
    });

  return days.map((day) => {
    const dayKey = getDateKey(day);
    const tasksCreated = createdByDay.get(dayKey) || 0;
    const tasksDone = doneByDay.get(dayKey) || 0;

    return {
      week: day.toLocaleDateString("en-US", { weekday: "short" }),
      tasksDone,
      tasksCreated,
    };
  });
};

export const TaskDoneChart = () => {
  const configId = useAppStore((state) => state.configId);
  const refreshKey = useAppStore((state) => state.refreshKey);
  const [data, setData] = useState<TaskChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configId) {
      setData([]);
      return;
    }

    const fetchTaskChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        const todoItems: TodoItem[] = await apiClient.get(
          `/todo-items?tet_config_id=${configId}`,
        );
        const safeItems = Array.isArray(todoItems) ? todoItems : [];
        setData(buildWeeklyTaskData(safeItems));
      } catch (err) {
        console.error("Failed to fetch task chart data:", err);
        setError("Failed to load task activity");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskChartData();
  }, [configId, refreshKey]);

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        {/* <h3 className="text-lg text-foreground font-bold">
          Weekly Task Activity
        </h3> */}
        <div className="flex gap-4">
          {CHART_LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground mb-2">Loading...</div>
      )}
      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}

      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              cursor={{ stroke: "#e5e7eb" }}
            />
            <Line
              type="monotone"
              dataKey="tasksDone"
              stroke="#22c55e"
              strokeWidth={2.5}
              strokeDasharray="0"
              dot={{ fill: "#22c55e", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Tasks Done"
            />
            <Line
              type="monotone"
              dataKey="tasksCreated"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Tasks Created"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
