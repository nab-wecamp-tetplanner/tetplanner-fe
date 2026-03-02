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
import { WEEKLY_FINANCE_DATA } from "../../constants/dashboard";
import dashboardApi from "../../services/dashboardService";
import { useAppStore } from "../../stores/useAppStore";
import type { WeeklyFinanceData } from "../../types/dashboard.types";

const CHART_LEGEND_ITEMS = [
  { color: "bg-cyan-400", label: "Income" },
  { color: "bg-red-400", label: "Expense" },
];

export const IncomeExpenseLineChart = () => {
  const configId = useAppStore((state) => state.configId);
  const [data, setData] = useState<WeeklyFinanceData[]>(WEEKLY_FINANCE_DATA);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configId) return;

    const fetchTrendData = async () => {
      try {
        setLoading(true);
        setError(null);
        const trendData = await dashboardApi.getSpendingTrend(configId, "week");
        setData(trendData);
      } catch (err) {
        console.error("Failed to fetch spending trend:", err);
        setError("Failed to load spending trend data");
        // Fallback to mock data on error
        setData(WEEKLY_FINANCE_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [configId]);

  return (
    <Card className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between mb-2">
        {/* <h3 className="text-lg text-foreground font-bold">
          Weekly Income & Expense
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
