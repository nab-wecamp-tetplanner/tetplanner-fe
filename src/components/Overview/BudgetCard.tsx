import { Trash2 } from "lucide-react";

type BudgetCardProps = {
  id: string; 
  icon: string;
  title: string;
  spent: number;
  total: number;
  progress: number;
  color: string;
  onUpdate: (id: string) => void; 
  onDelete: (id: string) => void;
};

export default function BudgetCard({
  id,
  icon,
  title,
  spent,
  total,
  progress,
  color,
  onUpdate,
  onDelete,
}: BudgetCardProps) {
  const SAFE_PERCENTAGE: number = 80;
  const isWarning = progress > SAFE_PERCENTAGE;

  return (
    <div className="p-5 bg-white rounded-2xl shadow-md border border-slate-50 w-full group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-md text-md">
            {icon}
          </div>
          <h3 className="font-bold text-md text-slate-800">{title}</h3>
        </div>
        
        <button 
          onClick={() => onDelete(id)}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
          title="Delete Category"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => onUpdate(id)}
          className="text-[11px] px-3 py-1.5 bg-slate-100 text-slate-500 font-bold uppercase rounded hover:bg-slate-900 hover:text-white transition-all"
        >
          Update Budget
        </button>
        <div
          className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
            isWarning 
              ? "text-rose-500 bg-rose-50 border-rose-100" 
              : "text-emerald-500 bg-emerald-50 border-emerald-100"
          }`}
        >
          {isWarning ? "Warning" : "Safe"}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <p className="text-[13px] font-bold text-slate-700">Spent</p>
          <p className="text-[12px] font-medium text-slate-500">
            {spent.toLocaleString()} / <span className="text-slate-900 font-bold">{total.toLocaleString()}</span>
          </p>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${color}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}