import type React from "react";
import { EllipsisVertical } from "lucide-react";

const SAFE_PERCENTAGE: number = 80;

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-5 bg-white rounded-2xl shadow-md border border-slate-50 ${className}`}>
    {children}
  </div>
);

type BudgetCardProps = {
  icon: string;
  title: string;
  spent: number;
  total: number;
  progress: number;
  color: string;
};

export default function BudgetCard({
  icon,
  title,
  spent,
  total,
  progress,
  color,
}: BudgetCardProps) {
  const isWarning = progress > SAFE_PERCENTAGE;

  return (
    <Card className="w-full max-w-md">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-md text-md">
            {icon}
          </div>
          <h3 className="font-bold text-md text-slate-800">{title}</h3>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <EllipsisVertical size={20} />
        </button>
      </div>

      {/* Action Buttons & Status */}
      <div className="flex justify-between items-center mb-2">
        <button className="text-[11px] px-3 py-1.5 bg-slate-100 text-slate-500 font-bold uppercase rounded hover:bg-slate-200 transition-all">
          Update Budget
        </button>
        <div
          className={`text-sm font-bold uppercase px-2 py-1 rounded border ${
            isWarning 
              ? "text-rose-500 bg-rose-50 border-rose-100" 
              : "text-emerald-500 bg-emerald-50 border-emerald-100"
          }`}
        >
          {isWarning ? "Warning" : "Safe"}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        <p className="text-[13px] font-bold text-slate-700">
          Đã chi : <span className="font-medium text-slate-500">{spent.toLocaleString()} / {total.toLocaleString()}</span>
        </p>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
}