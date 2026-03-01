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
import { WEEKLY_TASK_DATA } from "../../constants/dashboard";

const CHART_LEGEND_ITEMS = [
  { color: "bg-green-500", label: "Tasks Done" },
  { color: "bg-blue-500", label: "Tasks Created" },
  { color: "bg-purple-500", label: "Total Tasks" },
];

export const TaskDoneChart = () => {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        {/* <h3 className="text-lg text-foreground font-bold">
          Weekly Task Activity
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

      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={WEEKLY_TASK_DATA}
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
