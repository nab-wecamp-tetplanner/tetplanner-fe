import { useState } from "react";
import Card from "./Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Star, Plus, Clock, Bell } from "lucide-react";

const TaskOverviewHeader = () => (
  <div className="mb-4 mt-8">
    <h2 className="text-2xl text-foreground font-bold mb-1">Task Overview</h2>
  </div>
);

const TaskQuickStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Task Completed
            </p>
            <p className="text-3xl font-bold text-foreground">08</p>
          </div>
          <Star className="w-5 h-5 text-slate-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h.01a1 1 0 110 2H12zm-3.976 1.9a1 1 0 00-.217 1.393l5.25 6.301A1 1 0 0015 14.5V11a1 1 0 10-2 0v2.586l-3.88-4.644a1 1 0 00-1.317-.142z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xs font-medium text-green-600">10+ more</span>
          <span className="text-xs text-muted-foreground">from last week</span>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              New Task
            </p>
            <p className="text-3xl font-bold text-foreground">10</p>
          </div>
          <Plus className="w-5 h-5 text-slate-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h.01a1 1 0 110 2H12zm-3.976 1.9a1 1 0 00-.217 1.393l5.25 6.301A1 1 0 0015 14.5V11a1 1 0 10-2 0v2.586l-3.88-4.644a1 1 0 00-1.317-.142z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xs font-medium text-green-600">10+ more</span>
          <span className="text-xs text-muted-foreground">from last week</span>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Project Done
            </p>
            <p className="text-3xl font-bold text-foreground">10</p>
          </div>
          <div className="w-5 h-5 text-slate-300">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 1 1 0 000-2 4 4 0 00-4 4v10a4 4 0 004 4h12a4 4 0 004-4V5a4 4 0 00-4-4 1 1 0 000 2 2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h.01a1 1 0 110 2H12zm-3.976 1.9a1 1 0 00-.217 1.393l5.25 6.301A1 1 0 0015 14.5V11a1 1 0 10-2 0v2.586l-3.88-4.644a1 1 0 00-1.317-.142z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xs font-medium text-green-600">08+ more</span>
          <span className="text-xs text-muted-foreground">from last week</span>
        </div>
      </Card>
    </div>
  );
};

const TaskDoneChart = () => {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">(
    "monthly",
  );

  const monthlyData = [
    { month: "May", value1: 120, value2: 90 },
    { month: "Jun", value1: 200, value2: 140 },
    { month: "Jul", value1: 380, value2: 220 },
    { month: "Aug", value1: 320, value2: 280 },
    { month: "Sep", value1: 240, value2: 200 },
    { month: "Oct", value1: 180, value2: 150 },
    { month: "Nov", value1: 210, value2: 170 },
    { month: "Dec", value1: 150, value2: 120 },
    { month: "Jan", value1: 280, value2: 220 },
    { month: "Feb", value1: 350, value2: 260 },
    { month: "Mar", value1: 320, value2: 240 },
    { month: "Apr", value1: 190, value2: 140 },
  ];

  return (
    <Card className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-lg text-foreground font-bold">
          Task Done
        </h3>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button
            onClick={() => setTimeRange("daily")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === "daily"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeRange("weekly")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === "weekly"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`px-3 py-1.5 rounded-lg transition-colors border-b-2 ${
              timeRange === "monthly"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="month"
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
              dataKey="value1"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: "#6366f1", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={{ fill: "#38bdf8", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const TasksList = () => {
  const tasks = [
    {
      id: 1,
      status: "Start from",
      time: "9.00 am",
      title: "Search Inspiration for project",
      website: "www.uistore.com",
      comments: 8,
      progress: 24,
    },
    {
      id: 2,
      status: "Start from",
      time: "3.00 am",
      title: "Search Inspiration for project",
      website: "www.uistore.org",
      comments: 5,
      progress: 60,
    },
  ];

  return (
    <div>
      <h3 className="font-serif text-lg text-foreground font-bold mb-6">
        Task
      </h3>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0">
                <button className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white hover:shadow-lg transition-shadow">
                  <svg
                    className="w-5 h-5 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                  </svg>
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {task.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {task.time}
                </p>
              </div>

              <button className="shrink-0 text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-semibold text-indigo-600 mb-3">
              {task.title}
            </p>

            <div className="flex items-center gap-6 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <a href="#" className="text-indigo-600 hover:underline">
                  {task.website}
                </a>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span>{task.comments} comments</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {task.progress}% complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TaskOverview = () => {
  return (
    <section className="mb-16">
      <TaskOverviewHeader />
      <TaskQuickStats />
      <TaskDoneChart />
      <TasksList />
    </section>
  );
};
