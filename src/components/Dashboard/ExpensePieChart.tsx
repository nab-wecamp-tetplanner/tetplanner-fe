import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { useEffect, useState } from "react";
import Card from "../Dashboard/Card";
import { CATEGORY_DATA, CHART_COLORS } from "../../constants/dashboard";
import { transactionApi } from "../../services/transactionService";
import { useAppStore } from "../../stores/useAppStore";

interface CategoryExpense {
  id: string;
  name: string;
  percent: string;
  colorClass: string;
  bgClass: string;
  icon: string;
  value: number;
  hexColor: string;
}

const CustomDonutTooltip = ({
  active,
  payload,
}: TooltipContentProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-2 py-1 rounded-xl shadow-lg border border-slate-100 text-sm">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-slate-500 font-medium">
          {payload[0].payload.percent}
        </p>
      </div>
    );
  }
  return null;
};

export const ExpensePieChart = () => {
  const configId = useAppStore((state) => state.configId);
  const [chartParsedData, setChartParsedData] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCategories, setDisplayCategories] = useState<CategoryExpense[]>(
    [],
  );

  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!configId) {
        setLoading(false);
        setChartParsedData(
          CATEGORY_DATA.map((item) => {
            const rawValue = parseFloat(
              item.percent.replace(",", ".").replace("%", ""),
            );
            return {
              ...item,
              value: rawValue,
              hexColor: CHART_COLORS[item.bgClass] || "#cbd5e1",
            };
          }),
        );
        return;
      }

      try {
        // Fetch all transactions for the config
        const transactions = await transactionApi.getAll(configId);

        // Filter only expenses
        const expenses = transactions.filter((t) => t.type === "expense");

        // Group expenses by category and calculate totals
        const expenseByCategory = new Map<
          string,
          { total: number; items: typeof expenses }
        >();
        let totalExpense = 0;

        expenses.forEach((expense) => {
          const categoryId = expense.category?.id || "uncategorized";

          if (!expenseByCategory.has(categoryId)) {
            expenseByCategory.set(categoryId, { total: 0, items: [] });
          }

          const categoryData = expenseByCategory.get(categoryId)!;
          categoryData.total += expense.amount;
          categoryData.items.push(expense);
          totalExpense += expense.amount;
        });

        // Convert to chart data with percentages
        const processedData: CategoryExpense[] = [];

        expenseByCategory.forEach((data, categoryId) => {
          const percentage =
            totalExpense > 0 ? (data.total / totalExpense) * 100 : 0;
          const percentageStr =
            percentage > 0
              ? `${percentage.toFixed(2).replace(".", ",")}%`
              : "0,00%";

          // Find matching category in CATEGORY_DATA for styling
          const categoryInfo = CATEGORY_DATA.find(
            (cat) => cat.name.toLowerCase() === categoryId.toLowerCase(),
          );

          processedData.push({
            id: categoryId,
            name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
            percent: percentageStr,
            colorClass: categoryInfo?.colorClass || "text-slate-500",
            bgClass: categoryInfo?.bgClass || "bg-slate-500",
            icon: categoryInfo?.icon || "📦",
            value: percentage,
            hexColor:
              CHART_COLORS[categoryInfo?.bgClass || "bg-slate-500"] ||
              "#cbd5e1",
          });
        });

        // Sort by value descending
        processedData.sort((a, b) => b.value - a.value);

        setChartParsedData(processedData);
        setDisplayCategories(processedData);
      } catch (error) {
        console.error("Failed to fetch expense data:", error);
        // Fallback to mock data
        setChartParsedData(
          CATEGORY_DATA.map((item) => {
            const rawValue = parseFloat(
              item.percent.replace(",", ".").replace("%", ""),
            );
            return {
              ...item,
              value: rawValue,
              hexColor: CHART_COLORS[item.bgClass] || "#cbd5e1",
            };
          }),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, [configId]);

  if (loading) {
    return (
      <Card className="flex flex-col max-h-fit w-full">
        <h3 className="text-md text-foreground font-bold">
          Expenses by category
        </h3>
        <div className="flex items-center justify-center h-40">
          <p className="text-slate-500">Loading...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col max-h-fit w-full">
      <h3 className="text-md text-foreground font-bold">
        Expenses by category
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
        <div className="w-full md:w-1/2 h-40 relative">
          {chartParsedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartParsedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={70}
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">No expense data available</p>
            </div>
          )}
        </div>

        <div className="w-fit md:w-1/2 flex flex-col gap-2">
          {displayCategories.length > 0 ? (
            displayCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center text-[12px] hover:bg-slate-50 p-1 -mx-1 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm ${cat.bgClass}`}
                  >
                    {cat.icon}
                  </div>
                  <span className="font-medium text-foreground text-xs">
                    {cat.name}
                  </span>
                </div>
                <span className="text-slate-500 font-medium text-xs">
                  {cat.percent}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-xs">No categories</p>
          )}
        </div>
      </div>
    </Card>
  );
};
