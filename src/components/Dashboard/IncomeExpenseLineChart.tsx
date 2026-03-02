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
import {
  transactionApi,
  type TransactionResponse,
} from "../../services/transactionService";
import { useAppStore } from "../../stores/useAppStore";
import type { WeeklyFinanceData } from "../../types/dashboard.types";

const CHART_LEGEND_ITEMS = [
  { color: "bg-cyan-400", label: "Income" },
  { color: "bg-red-400", label: "Expense" },
];

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

const parseTransactionDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : toStartOfDay(parsed);
};

const buildWeeklyFinanceData = (
  transactions: TransactionResponse[],
): WeeklyFinanceData[] => {
  const days = getRecentDays();
  const firstDay = days[0];

  const incomeByDay = new Map<string, number>();
  const expenseByDay = new Map<string, number>();

  transactions.forEach((transaction) => {
    const transactionDate = parseTransactionDate(transaction.transaction_date);

    if (transactionDate && transactionDate >= firstDay) {
      const dayKey = getDateKey(transactionDate);

      if (transaction.type === "income") {
        incomeByDay.set(
          dayKey,
          (incomeByDay.get(dayKey) || 0) + transaction.amount,
        );
      } else if (transaction.type === "expense") {
        expenseByDay.set(
          dayKey,
          (expenseByDay.get(dayKey) || 0) + transaction.amount,
        );
      }
    }
  });

  return days.map((day) => {
    const dayKey = getDateKey(day);
    return {
      week: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      income: incomeByDay.get(dayKey) || 0,
      expense: expenseByDay.get(dayKey) || 0,
    };
  });
};

export const IncomeExpenseLineChart = () => {
  const configId = useAppStore((state) => state.configId);
  const refreshKey = useAppStore((state) => state.refreshKey);
  const [data, setData] = useState<WeeklyFinanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configId) {
      setData([]);
      return;
    }

    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const transactions = await transactionApi.getAll(configId);
        const safeTransactions = Array.isArray(transactions)
          ? transactions
          : [];
        setData(buildWeeklyFinanceData(safeTransactions));
      } catch (err) {
        console.error("Failed to fetch transaction data:", err);
        setError("Failed to load income/expense data");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [configId, refreshKey]);

  return (
    <Card className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-4">
          {CHART_LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-xs text-(--text-muted)">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-sm text-(--text-muted) mb-2">Loading...</div>
      )}
      {error && <div className="text-sm text-(--danger) mb-2">{error}</div>}

      <div className="w-full flex-1 ">
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
              dataKey="income"
              stroke="#38bdf8"
              strokeWidth={2.5}
              strokeDasharray="0"
              dot={{ fill: "#38bdf8", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#f87171"
              strokeWidth={2}
              strokeDasharray="5 5"
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
