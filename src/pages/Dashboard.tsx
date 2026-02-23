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
import { CheckSquare, ShoppingCart, DollarSign } from "lucide-react";
import CalendarSection from "../components/Dashboard/CalendarSection";
import TaskListWidget from "../components/Overview/TaskWidget";
import type { TetConfig } from "../types/tetConfig.types";
import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import type { TooltipContentProps } from "recharts";
import BudgetCard from "../components/Overview/BudgetCard";

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
  const weeklyData = [
    { week: "Mon", tasksDone: 8, tasksCreated: 5, totalTasks: 24 },
    { week: "Tue", tasksDone: 12, tasksCreated: 7, totalTasks: 28 },
    { week: "Wed", tasksDone: 15, tasksCreated: 4, totalTasks: 30 },
    { week: "Thu", tasksDone: 10, tasksCreated: 8, totalTasks: 32 },
    { week: "Fri", tasksDone: 18, tasksCreated: 6, totalTasks: 35 },
    { week: "Sat", tasksDone: 14, tasksCreated: 3, totalTasks: 33 },
    { week: "Sun", tasksDone: 9, tasksCreated: 5, totalTasks: 31 },
  ];

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg text-foreground font-bold">
          Weekly Task Activity
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">Tasks Done</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-muted-foreground">Tasks Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-muted-foreground">Total Tasks</span>
          </div>
        </div>
      </div>

      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={weeklyData}
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
              strokeWidth={3}
              dot={{ fill: "#22c55e", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Tasks Done"
            />
            <Line
              type="monotone"
              dataKey="tasksCreated"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Tasks Created"
            />
            <Line
              type="monotone"
              dataKey="totalTasks"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ fill: "#a855f7", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Total Tasks"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
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

const ExpensePieChart = () => {
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
    <Card className="flex flex-col h-full w-full">
      <h3 className="text-md text-foreground font-bold">
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
              <RechartsTooltip content={CustomDonutTooltip} cursor={false} />
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
  );
};

const IncomeExpenseLineChart = () => {
  const weeklyData = [
    { week: "Mon", income: 450, expense: 320 },
    { week: "Tue", income: 380, expense: 280 },
    { week: "Wed", income: 520, expense: 390 },
    { week: "Thu", income: 410, expense: 340 },
    { week: "Fri", income: 580, expense: 420 },
    { week: "Sat", income: 350, expense: 250 },
    { week: "Sun", income: 290, expense: 180 },
  ];

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg text-foreground font-bold">
          Weekly Income & Expense
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-xs text-muted-foreground">Expense</span>
          </div>
        </div>
      </div>

      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={weeklyData}
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
              dataKey="income"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ fill: "#38bdf8", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#f87171"
              strokeWidth={3}
              dot={{ fill: "#f87171", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
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
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-col">
        <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-0 justify-between">
          <CalendarSection />
          <div className="flex flex-col gap-4 w-full md:max-w-[50%] ">
            <TaskQuickStats />
            <div className="flex gap-4">
              <TaskListWidget tetConfigs={configs.map((c) => c.id)} />
              <div className="flex flex-col gap-4 flex-1">
                <BudgetCard
                  icon="🎄"
                  title="Tết Budget"
                  spent={7000000}
                  total={10000000}
                  progress={70}
                  color="bg-red-500"
                />
                <BudgetCard
                  icon="🛍️"
                  title="Shopping"
                  spent={2500000}
                  total={5000000}
                  progress={50}
                  color="bg-blue-500"
                />
                <BudgetCard
                  icon="🎁"
                  title="Gifts"
                  spent={3200000}
                  total={4000000}
                  progress={80}
                  color="bg-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ExpensePieChart />
          <IncomeExpenseLineChart />
          <TaskDoneChart />
        </div>
      </main>
    </div>
  );
}
