import React, { useState } from "react";
import { Header } from "../components/Header";
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
import { Calendar, Banknote, TrendingUp, TrendingDown } from "lucide-react";

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
      },
      {
        id: "h2",
        iconText: "OR",
        name: "Housing",
        method: "Bank account",
        date: "2024/04/01",
        amount: "-$750.00",
        isIncome: false,
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
      },
      {
        id: "t2",
        iconText: "OR",
        name: "Cleaning",
        method: "Bank account",
        date: "2024/04/01",
        amount: "-$25.00",
        isIncome: false,
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

const PageHeader = () => (
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-8">
    <div>
      <p className="text-sm font-medium text-primary mb-1 tracking-wide uppercase">
        Dashboard
      </p>
      <h1 className="text-4xl font-serif text-foreground mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        Overview of your financial status and transactions
      </p>
    </div>
    <div className="mt-4 md:mt-0 flex items-center gap-1 bg-card p-1 rounded-xl border border-border text-sm font-medium text-muted-foreground">
      <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold">
        This month
      </button>
      <button className="px-3 py-1.5 hover:bg-muted rounded-lg text-xs">
        Last month
      </button>
      <button className="px-3 py-1.5 hover:bg-muted rounded-lg text-xs">
        This year
      </button>
      <button className="px-3 py-1.5 hover:bg-muted rounded-lg text-xs flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" />
        Custom
      </button>
    </div>
  </div>
);

// const SummaryCards = () => (
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//     <Card className="flex flex-col gap-2">
//       <span className="text-gray-500 text-sm font-medium">Balance</span>
//       <div className="flex items-end justify-between">
//         <span className="text-4xl font-bold text-blue-600">$5,502.45</span>
//       </div>
//     </Card>
//     <Card className="flex flex-col gap-2">
//       <span className="text-gray-500 text-sm font-medium">Incomes</span>
//       <div className="flex items-end justify-between">
//         <span className="text-4xl font-bold text-gray-900">$9,450.00</span>
//         <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
//           ↑ 27%
//         </span>
//       </div>
//     </Card>
//     <Card className="flex flex-col gap-2">
//       <span className="text-gray-500 text-sm font-medium">Expenses</span>
//       <div className="flex items-end justify-between">
//         <span className="text-4xl font-bold text-gray-900">$3,945.55</span>
//         <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium">
//           ↓ -15%
//         </span>
//       </div>
//     </Card>
//   </div>
// );

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
                    <span className="font-medium text-slate-700">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    {cat.percent}
                  </span>
                </div>
              ))}
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
                    <span className="font-medium text-slate-700">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium">
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
        Detailed Transactions by Category
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
                <div className="pl-12 pr-4 py-2 flex flex-col gap-1">
                  {category.transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center py-2 text-sm border-b border-dashed border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium">
                          {txn.iconText}
                        </div>
                        <span className="font-semibold text-gray-700">
                          {txn.name}
                        </span>
                      </div>
                      <span className="text-gray-400">{txn.method}</span>
                      <span className="text-gray-400">{txn.date}</span>
                      <span
                        className={`font-bold text-right pr-4 ${txn.isIncome ? "text-green-500" : "text-gray-800"}`}
                      >
                        {txn.amount}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        ⋮
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
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <PageHeader />
        <QuickStats />
        <ChartsSection />
        <GroupedTransactions />
      </main>
    </div>
  );
}
