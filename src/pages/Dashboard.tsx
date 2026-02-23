import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Card from "../components/Dashboard/Card";
import StatsCard from "../components/Dashboard/StatsCard";
import { Bell, CheckSquare, ShoppingCart, DollarSign } from "lucide-react";
import CalendarSection from "../components/Dashboard/CalendarSection";
import TaskListWidget from "../components/Overview/TaskWidget";
import type { TetConfig } from "../types/tetConfig.types";
import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import type { TooltipContentProps } from "recharts";

const TaskQuickStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-0 w-full h-fit">
      <StatsCard
        title="Công việc"
        value={40}
        subtitle={`40% hoàn thành`}
        icon={<CheckSquare className="w-5 h-5" />}
        color="#5051f9"
      />
      <StatsCard
        title="Mua sắm"
        value={45}
        subtitle={`5 đã mua`}
        icon={<ShoppingCart className="w-5 h-5" />}
        color="#1ea7ff"
      />
      <StatsCard
        title="Ngân sách"
        value={60}
        subtitle={`70₫ / 100₫`}
        icon={<DollarSign className="w-5 h-5" />}
        color="#ff614c"
      />
    </div>
  );
};

const TaskDoneChart = () => {
  // const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">(
  //   "monthly",
  // );

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
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg text-foreground font-bold">Task Done</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-xs text-muted-foreground">Value 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
            <span className="text-xs text-muted-foreground">Value 2</span>
          </div>
        </div>
      </div>

      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
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
      title: "Search Inspiration for project",
      progress: 24,
    },
    {
      id: 2,
      title: "Search Inspiration for project",
      progress: 60,
    },
  ];

  return (
    <div>
      <h3 className="text-lg text-foreground font-bold mb-6">Ongoing Task</h3>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-2 mb-4 justify-between">
              <div className="flex items-center gap-4 shrink-0">
                <button className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white hover:shadow-lg transition-shadow">
                  <svg
                    className="w-5 h-5 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                  </svg>
                </button>
                <p className="text-sm font-semibold text-indigo-600">
                  {task.title}
                </p>
              </div>

              <button className="shrink-0 text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
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

type Transaction = {
  id: string;
  name: string;
  method: string;
  date: string;
  amount: string;
  isIncome: boolean;
  iconText: string;
  iconBg: string;
  iconColor: string;
};

type Category = {
  id: string;
  name: string;
  percent: string;
  colorClass: string;
  bgClass: string;
  icon: string;
  transactions: Transaction[];
};

// Mock data
const categoryData: Category[] = [
  {
    id: "house",
    name: "House",
    percent: "41,35%",
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500",
    icon: "🏠",
    transactions: [
      {
        id: "h1",
        iconText: "OR",
        name: "Electricity",
        method: "Bank account",
        date: "2024/04/01",
        amount: "-$150.00",
        isIncome: false,
        iconBg: "bg-planner-purple-light",
        iconColor: "text-planner-purple",
      },
      {
        id: "h2",
        iconText: "OR",
        name: "Housing",
        method: "Bank account",
        date: "2024/04/01",
        amount: "-$750.00",
        isIncome: false,
        iconBg: "bg-planner-purple-light",
        iconColor: "text-planner-purple",
      },
    ],
  },
  {
    id: "transport",
    name: "Transportation",
    percent: "13,47%",
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500",
    icon: "🚌",
    transactions: [
      {
        id: "t1",
        iconText: "OR",
        name: "Gas",
        method: "Bank account",
        date: "2024/04/01",
        amount: "-$50.00",
        isIncome: false,
        iconBg: "bg-planner-blue-light",
        iconColor: "text-planner-blue",
      },
      {
        id: "t2",
        iconText: "OR",
        name: "Cleaning",
        method: "Bank account",
        date: "2024/04/01",
        amount: "-$25.00",
        isIncome: false,
        iconBg: "bg-planner-blue-light",
        iconColor: "text-planner-blue",
      },
    ],
  },
  {
    id: "groceries",
    name: "Groceries",
    percent: "9,97%",
    colorClass: "text-green-500",
    bgClass: "bg-green-500",
    icon: "🛒",
    transactions: [
      {
        id: "g1",
        iconText: "CM",
        name: "Carrefour Market",
        method: "Credit card",
        date: "2024/03/26",
        amount: "-$64.33",
        isIncome: false,
        iconBg: "bg-planner-green-light",
        iconColor: "text-planner-green",
      },
    ],
  },
  {
    id: "credit",
    name: "Credit card",
    percent: "21,51%",
    colorClass: "text-red-500",
    bgClass: "bg-red-500",
    icon: "💳",
    transactions: [],
  },
  {
    id: "shopping",
    name: "Shopping",
    percent: "3,35%",
    colorClass: "text-indigo-600",
    bgClass: "bg-indigo-600",
    icon: "🛍️",
    transactions: [
      {
        id: "s1",
        iconText: "A",
        name: "Amazon",
        method: "Credit card",
        date: "2024/03/24",
        amount: "-$147.90",
        isIncome: false,
        iconBg: "bg-planner-purple-light",
        iconColor: "text-planner-purple",
      },
    ],
  },
];

const chartColors: Record<string, string> = {
  "bg-purple-500": "#a855f7",
  "bg-blue-500": "#3b82f6",
  "bg-green-500": "#22c55e",
  "bg-red-500": "#ef4444",
  "bg-indigo-600": "#4f46e5",
};

const dailyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  income: Math.floor(Math.random() * 500) + 100,
  expense: Math.floor(Math.random() * 400) + 50,
}));

// Custom Tooltips
const CustomDonutTooltip = ({
  active,
  payload,
}: TooltipContentProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 text-sm">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-slate-500 font-medium">
          {payload[0].payload.percent}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({
  active,
  payload,
  label,
}: TooltipContentProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm min-w-30">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-50 pb-1">
          {label}
        </p>
        <div className="space-y-1">
          <p className="flex justify-between text-blue-600">
            <span>Income:</span>{" "}
            <span className="font-bold">${payload[0].value}k</span>
          </p>
          <p className="flex justify-between text-red-500">
            <span>Expense:</span>{" "}
            <span className="font-bold">${payload[1].value}k</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const BudgetChartsSection = () => {
  const chartParsedData = categoryData.map((item) => {
    const rawValue = parseFloat(
      item.percent.replace(",", ".").replace("%", ""),
    );
    return {
      ...item,
      value: rawValue,
      hexColor: chartColors[item.bgClass] || "#cbd5e1",
    };
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* PIE / DONUT CHART */}
        <Card className="flex flex-col h-full">
          <h3 className="font-serif text-md text-foreground font-bold">
            Expense vs Budget
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
            <div className="w-full md:w-1/2 h-50 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Expense", value: 3100000, fill: "#f87171" },
                      {
                        name: "Budget",
                        value: 5000000 - 3100000,
                        fill: "#38bdf8",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  ></Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [
                      (value as number).toLocaleString() + " VND",
                      name,
                    ]}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-4 items-start justify-center">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-[#f87171]"></div>
                <span className="font-medium text-foreground text-sm">
                  Expense:
                </span>
                <span className="text-foreground text-sm font-bold">
                  3,100,000 VND
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-[#38bdf8]"></div>
                <span className="font-medium text-foreground text-sm">
                  Budget:
                </span>
                <span className="text-foreground text-sm font-bold">
                  5,000,000 VND
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col h-full">
          <h3 className="font-serif text-md text-foreground font-bold">
            Expenses by category
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
            <div className="w-full md:w-1/2 h-50 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartParsedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartParsedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.hexColor} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={CustomDonutTooltip}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-3">
              {categoryData.map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center text-[13px] hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] shadow-sm ${cat.bgClass}`}
                    >
                      {cat.icon}
                    </div>
                    <span className="font-medium text-foreground text-sm">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium text-sm">
                    {cat.percent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* LINE CHART */}
      <Card className="flex flex-col h-100 mb-8">
        <h3 className="font-serif text-md text-foreground font-bold mb-4">
          Income & Expense
        </h3>

        <div className="flex-1 w-full h-50">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
                vertical={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                width={40}
                domain={[0, "dataMax + 500"]}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                interval={4}
                label={{
                  value: "Day",
                  position: "insideBottomRight",
                  offset: -5,
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />
              <RechartsTooltip
                content={CustomBarTooltip}
                cursor={{ stroke: "#f8fafc", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#f87171"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <div className="w-3 h-3 bg-[#38bdf8] rounded-[3px]"></div> Income
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <div className="w-3 h-3 bg-[#f87171] rounded-[3px]"></div> Expense
          </div>
        </div>
      </Card>
    </>
  );
};

export default function Dashboard() {
  const [configs, setConfigs] = useState<TetConfig[]>([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      const response = await apiClient.tetConfigs.getMyConfigs();
      setConfigs(response);
    };

    fetchConfigs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-0 justify-between">
          <CalendarSection />
          <div className="flex flex-col gap-4 w-full md:max-w-[50%]">
            <TaskQuickStats />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TaskListWidget tetConfigs={configs.map((c) => c.id)} />
              <TaskListWidget tetConfigs={configs.map((c) => c.id)} />
            </div>
          </div>
        </div>
        {/* <TaskDoneChart /> */}
        <TasksList />
        <BudgetChartsSection />
      </main>
    </div>
  );
}
