import { Header } from "../components";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};
type BadgeProps = {
  text: string;
  isPositive: boolean;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: (typeof expenseCategories)[number];
  }>;
}

const Card = ({ children, className = "" }: CardProps) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ text, isPositive }: BadgeProps) => (
  <span
    className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1
    ${isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
  >
    {isPositive ? "↑" : "↓"} {text}
  </span>
);

// ==========================================
// 2. SPECIFIC COMPONENTS (Thành phần chi tiết)
// ==========================================

const PageHeader = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mt-2 mb-2">
    <h1 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">
      Hello, Mark!
    </h1>

    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-500">
      <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
        This month
      </button>
    </div>
  </div>
);

const SummarySection = () => {
  const data = [
    {
      title: "Balance",
      amount: "$5,502.45",
      trend: "12,5%",
      isPositive: true,
      amountColor: "text-blue-600",
    },
    {
      title: "Incomes",
      amount: "$9,450.00",
      trend: "27%",
      isPositive: true,
      amountColor: "text-gray-900",
    },
    {
      title: "Expenses",
      amount: "$3,945.55",
      trend: "15%",
      isPositive: false,
      amountColor: "text-gray-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
      {data.map((item, index) => (
        <Card key={index} className="flex flex-col gap-1">
          <span className="text-gray-500 text-sm font-medium">
            {item.title}
          </span>
          <div className="flex items-end justify-between">
            <span className={`text-xl font-bold ${item.amountColor}`}>
              {item.amount}
            </span>
            <Badge text={item.trend} isPositive={item.isPositive} />
          </div>
        </Card>
      ))}
    </div>
  );
};

const GoalsSection = () => {
  const goals = [
    {
      amount: "10.000.000 VND",
      date: "12/20/20",
      icon: "🌴",
      title: "Holidays",
    },
    {
      amount: "20.000.000 VND",
      date: "12/20/20",
      icon: "🧱",
      title: "Renovation",
    },
    { amount: "5.000.000 VND", date: "12/20/20", icon: "🎮", title: "Xbox" },
  ];

  return (
    <div className="mb-1 mt-2">
      <div className="flex items-center gap-3 mb-1">
        <h3 className="text-lg font-bold text-gray-900">Goals</h3>
        <button className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-sm hover:bg-yellow-500">
          +
        </button>
      </div>
      <div className="grid grid-cols-5 gap-6 overflow-x-auto pb-2">
        {goals.map((goal, index) => (
          <Card
            key={index}
            className="min-w-[200px] flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-row items-center text-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mr-2">
                  {goal.icon}
                </div>
                <div className="text-gray-400 font-semibold">{goal.title}</div>
              </div>
            </div>
            <div>
              <h3 className="text-gray-900 font-medium">{goal.amount}</h3>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Dữ liệu mẫu kết hợp cho cả biểu đồ và phần chú thích (Legend)
const expenseCategories = [
  {
    name: "House",
    value: 41.35,
    color: "#A855F7",
    bgClass: "bg-purple-500",
    icon: "🏠",
  },
  {
    name: "Credit card",
    value: 21.51,
    color: "#EF4444",
    bgClass: "bg-red-500",
    icon: "💳",
  },
  {
    name: "Transportation",
    value: 13.47,
    color: "#3B82F6",
    bgClass: "bg-blue-500",
    icon: "🚌",
  },
  {
    name: "Groceries",
    value: 9.97,
    color: "#10B981",
    bgClass: "bg-emerald-500",
    icon: "🛒",
  },
  {
    name: "Shopping",
    value: 3.35,
    color: "#6366F1",
    bgClass: "bg-indigo-500",
    icon: "🛍️",
  },
];

// Custom Tooltip khi hover vào biểu đồ
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-2 rounded-xl shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] border border-slate-50 text-sm">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-slate-500">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const ExpenseChartWidget = () => {
  return (
    <Card className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-slate-800 text-[16px]">
          Expenses by category
        </h2>
        <button className="text-slate-400 hover:text-slate-600 text-xl font-light">
          ⋮
        </button>
      </div>

      {/* Khu vực vẽ biểu đồ Recharts */}
      <div className="h-[220px] w-full mb-6 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseCategories}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={95}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {expenseCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Nội dung nằm chính giữa Donut Chart */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Total
          </span>
          <span className="text-slate-800 text-lg font-bold">100%</span>
        </div>
      </div>

      {/* Danh sách chú thích (Legend) */}
      <div className="flex flex-col gap-4 mt-auto">
        {expenseCategories.map((cat, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-[14px] group cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${cat.bgClass} shadow-sm group-hover:scale-110 transition-transform`}
              >
                <span className="text-[14px]">{cat.icon}</span>
              </div>
              <span className="font-medium text-slate-700">{cat.name}</span>
            </div>
            <span className="text-slate-400 font-medium">{cat.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const LastTransactions = () => {
  const transactions = [
    {
      icon: "OR",
      iconBg: "bg-gray-100",
      name: "Orlando Rodrigues",
      method: "Bank account",
      date: "2024/04/01",
      amount: "+$750.00",
      isIncome: true,
    },
    {
      icon: "N",
      iconBg: "bg-red-100 text-red-600 font-bold",
      name: "Netflix",
      method: "Credit card",
      date: "2024/03/29",
      amount: "-$9.90",
      isIncome: false,
    },
    {
      icon: "S",
      iconBg: "bg-green-100 text-green-600 font-bold",
      name: "Spotify",
      method: "Credit card",
      date: "2024/03/29",
      amount: "-$19.90",
      isIncome: false,
    },
    {
      icon: "CA",
      iconBg: "bg-gray-100",
      name: "Carl Andrew",
      method: "Bank account",
      date: "2024/03/27",
      amount: "+$400.00",
      isIncome: true,
    },
    {
      icon: "CM",
      iconBg: "bg-gray-100",
      name: "Carrefour Market",
      method: "Credit card",
      date: "2024/03/26",
      amount: "-$64.33",
      isIncome: false,
    },
    {
      icon: "A",
      iconBg: "bg-gray-800 text-white font-bold",
      name: "Amazon",
      method: "Credit card",
      date: "2024/03/24",
      amount: "-$147.90",
      isIncome: false,
    },
    {
      icon: "Sh",
      iconBg: "bg-green-50 text-green-700 font-bold",
      name: "Shopify",
      method: "Credit card",
      date: "2024/03/21",
      amount: "-$57.98",
      isIncome: false,
    },
  ];

  return (
    <Card className="h-full">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900">Last transactions</h3>
        <p className="text-sm text-gray-500 mt-1">
          Check your last transactions
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="font-normal pb-3 w-1/3">Description</th>
              <th className="font-normal pb-3 w-1/4">Method</th>
              <th className="font-normal pb-3 w-1/4">Date</th>
              <th className="font-normal pb-3">Amount</th>
              <th className="font-normal pb-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr
                key={index}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="py-4 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${txn.iconBg}`}
                  >
                    {txn.icon}
                  </div>
                  <span className="font-bold text-gray-800">{txn.name}</span>
                </td>
                <td className="py-4 text-gray-500">{txn.method}</td>
                <td className="py-4 text-gray-500">{txn.date}</td>
                <td
                  className={`py-4 font-bold ${txn.isIncome ? "text-green-500" : "text-gray-800"}`}
                >
                  {txn.amount}
                </td>
                <td className="py-4 text-gray-400 cursor-pointer hover:text-gray-600">
                  ⋮
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ==========================================
// 3. MAIN LAYOUT (Khung sườn chính)
// ==========================================

export default function FinanceDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <PageHeader />
        <SummarySection />
        <GoalsSection />

        {/* Lưới 2 cột cho phần Bottom Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <ExpenseChartWidget />
          <LastTransactions />
        </div>
      </main>
    </div>
  );
}
