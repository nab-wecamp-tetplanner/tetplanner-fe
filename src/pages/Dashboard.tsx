import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Banknote,
  TrendingUp,
  TrendingDown,
  MoreVertical,
} from "lucide-react";

// ==========================================
// 1. TYPES & MOCK DATA
// ==========================================

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

// Mock daily data for a month (days 1-30)
const dailyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  income: Math.floor(Math.random() * 500) + 100, // Random income between 100-600
  expense: Math.floor(Math.random() * 400) + 50, // Random expense between 50-450
}));

// ==========================================
// 2. REUSABLE COMPONENTS
// ==========================================

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}
  >
    {children}
  </div>
);

// ==========================================
// 3. PAGE SECTIONS
// ==========================================
// --- Custom Tooltips ---
import type { TooltipContentProps } from "recharts";

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

const QuickStats = () => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-planner-blue-light flex items-center justify-center">
          <Banknote className="w-5 h-5 text-planner-blue" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            Current balance
          </p>
          <p className="text-xl font-bold text-planner-blue">5.000.000 VND</p>
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-planner-green-light flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-planner-green" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            Total income
          </p>
          <p className="text-xl font-bold text-planner-green">1.000.000 VND</p>
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-planner-pink-light flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-planner-pink" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            Total expense
          </p>
          <p className="text-xl font-bold text-planner-pink">3.100.000 VND</p>
        </div>
      </div>
    </div>
  );
};

// --- Phần Component Biểu đồ ---
const ChartsSection = () => {
  // Chuẩn bị dữ liệu cho PieChart: convert '41,35%' -> 41.35
  const chartParsedData = categoryData.map((item) => {
    // Ép chuỗi phần trăm về số thực để Recharts vẽ được biểu đồ
    const rawValue = parseFloat(
      item.percent.replace(",", ".").replace("%", ""),
    );
    return {
      ...item,
      value: rawValue,
      hexColor: chartColors[item.bgClass] || "#cbd5e1", // Gán màu Hex tương ứng
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
            {/* Pie chart for Expense vs Budget */}
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
                    formatter={(value: number = 0, name: string = "") => [
                      value.toLocaleString() + " VND",
                      name,
                    ]}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Budget and Expense numbers */}
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
            {/* Vùng vẽ biểu đồ */}
            <div className="w-full md:w-1/2 h-50 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartParsedData} // Truyền dữ liệu đã parse
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

            {/* Chú thích (Legend) - Dùng categoryData gốc */}
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

      {/* BAR CHART */}
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

const GroupedTransactions = () => {
  const [openCategories, setOpenCategories] = useState<string[]>([
    "house",
    "transport",
  ]);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id],
    );
  };

  return (
    <Card className="mb-12">
      <h3 className="font-serif text-lg text-foreground font-bold mb-6">
        Detailed transactions by category
      </h3>
      <div className="flex flex-col gap-2">
        {categoryData.map((category) => {
          const isOpen = openCategories.includes(category.id);

          return (
            <div
              key={category.id}
              className="flex flex-col border-b border-gray-100 last:border-0 pb-2"
            >
              <div
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-sm ${category.bgClass}`}
                  >
                    {category.icon}
                  </div>
                  <span className="font-bold text-gray-800 text-base font-serif">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-500 font-medium">
                  {category.percent}
                  <span className="text-xs">{isOpen ? "▼" : "▶"}</span>
                </div>
              </div>

              {isOpen && category.transactions.length > 0 && (
                <div className="pl-12 pr-4 py-2 flex flex-col">
                  {category.transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center px-5 gap-4 py-4 hover:bg-muted/40 transition-colors border-b border-border first:border-t "
                    >
                      {/* Icon */}
                      <div
                        className={`shrink-0 h-9 w-9 rounded-lg ${txn.iconBg} flex items-center justify-center`}
                      >
                        <span className={`text-xs font-bold ${txn.iconColor}`}>
                          {txn.iconText}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground text-sm">
                          {txn.name}
                        </span>
                        {category && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {txn.method}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foregro">
                        <Calendar className="w-3.5 h-3.5" />
                        {txn.date}
                      </div>

                      {/* Amount */}
                      <span
                        className={`font-bold text w-28 text-right ${txn.isIncome ? "text-planner-green" : "text-foreground"}`}
                      >
                        {txn.amount}
                      </span>

                      {/* Actions */}
                      <button className="p-1.5 hover:bg-muted rounded-lg transition-col">
                        <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {isOpen && category.transactions.length === 0 && (
                <div className="pl-12 py-3 text-sm text-gray-400 italic">
                  No transactions in this period.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ==========================================
// 4. MAIN DASHBOARD PAGE
// ==========================================

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <QuickStats />
        <ChartsSection />
        <GroupedTransactions />
      </main>
    </div>
  );
}
