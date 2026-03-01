import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import Card from "../Dashboard/Card";
import { CATEGORY_DATA, CHART_COLORS } from "../../constants/dashboard";

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
  const chartParsedData = CATEGORY_DATA.map((item) => {
    const rawValue = parseFloat(
      item.percent.replace(",", ".").replace("%", ""),
    );
    return {
      ...item,
      value: rawValue,
      hexColor: CHART_COLORS[item.bgClass] || "#cbd5e1",
    };
  });

  return (
    <Card className="flex flex-col max-h-fit w-full">
      <h3 className="text-md text-foreground font-bold">
        Expenses by category
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
        <div className="w-full md:w-1/2 h-40 relative">
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
              <RechartsTooltip content={CustomDonutTooltip} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-fit md:w-1/2 flex flex-col gap-2">
          {CATEGORY_DATA.map((cat) => (
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
          ))}
        </div>
      </div>
    </Card>
  );
};
