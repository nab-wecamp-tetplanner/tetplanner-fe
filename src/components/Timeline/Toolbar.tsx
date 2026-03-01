/* TaskToolbar.tsx */
import { Plus, Download, Upload } from "lucide-react";

export type ViewType = "day" | "week" | "month";

interface TaskToolbarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onAddClick: () => void;
}

export default function TaskToolbar({
  activeView,
  onViewChange,
  onAddClick,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between mb-8 gap-4 px-1">
      {/* 1. VIEW TOGGLES: Nhỏ nhắn, gọn gàng */}
      <div className="grid grid-cols-3 p-1 bg-(--bg-card)/40 border border-(--border)/60 rounded-lg w-full sm:w-56 h-8.5">
        {(["day", "week", "month"] as ViewType[]).map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`flex items-center justify-center text-[11px] font-bold capitalize rounded-lg transition-all duration-300 ${
              activeView === view
                ? "bg-(--bg-card) text-(--primary) shadow-sm border border-(--border)/60"
                : "text-(--text) opacity-40 hover:opacity-100"
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* 2. ACTION GROUP: Compact & Equal Dimensions */}
      <div className="flex items-center gap-2">
        {/* Nút Import */}
        <button
          onClick={() => alert("Import")}
          className="flex items-center justify-center gap-2 h-8.5 w-24 bg-(--bg-card) border border-(--border)/80 rounded-lg hover:border-(--primary) hover:bg-(--primary)/5 transition-all duration-300 group"
        >
          <Download className="w-3.5 h-3.5 text-(--text) opacity-30 group-hover:text-(--primary) group-hover:opacity-100 transition-all" />
          <span className="text-[11px] font-bold text-(--text) opacity-60 group-hover:text-(--primary) group-hover:opacity-100">
            Import
          </span>
        </button>

        {/* Nút Export */}
        <button
          onClick={() => alert("Export")}
          className="flex items-center justify-center gap-2 h-8.5 w-24 bg-(--bg-card) border border-(--border)/80 rounded-lg hover:border-(--primary) hover:bg-(--primary)/5 transition-all duration-300 group"
        >
          <Upload className="w-3.5 h-3.5 text-(--text) opacity-30 group-hover:text-(--primary) group-hover:opacity-100 transition-all" />
          <span className="text-[11px] font-bold text-(--text) opacity-60 group-hover:text-(--primary) group-hover:opacity-100">
            Export
          </span>
        </button>

        {/* Nút Add Task: Kích thước bằng hệt 2 nút trên, không còn "lố" */}
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 h-8.5 w-8.5 bg-(--primary) text-white rounded-lg shadow-sm hover:brightness-105 transition-all duration-300 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
}
