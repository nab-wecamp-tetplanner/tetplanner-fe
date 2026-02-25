import { Plus, Download, Upload } from "lucide-react";

export type ViewType = "day" | "week" | "month";

interface TaskToolbarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddClick: () => void;
}

export default function TaskToolbar({
  activeView,
  onViewChange,
  searchTerm,
  onSearchChange,
  onAddClick,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
      {/* View Toggles */}
      <div className="flex gap-2 bg-muted/40 p-1 rounded-lg border border-border">
        <button
          onClick={() => onViewChange("day")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeView === "day"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Day
        </button>
        <button
          onClick={() => onViewChange("week")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeView === "week"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onViewChange("month")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeView === "month"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Month
        </button>
      </div>

      {/* Search & Add Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => alert("Chức năng Import Excel/CSV")}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-muted text-sm font-medium rounded-xl shadow-sm transition-colors text-foreground"
          title="Import Tasks"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={() => alert("Chức năng Export Excel/CSV")}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-muted text-sm font-medium rounded-xl shadow-sm transition-colors text-foreground"
          title="Export Tasks"
        >
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          onClick={onAddClick}
          className="bg-planner-blue hover:bg-planner-blue/90 text-white p-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
