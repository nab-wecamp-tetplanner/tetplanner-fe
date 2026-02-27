import React from "react";
import { Plus, Calendar, Edit, Trash2, Clock } from "lucide-react"; // Thêm Clock để làm icon trang trí
import type { Timeline } from "../../types/timeline.types";

interface TimelinePhasesSectionProps {
  phases: Timeline[];
  onAddPhase: () => void;
  onEditPhase: (phase: Timeline) => void;
  onDeletePhase: (phaseId: string) => void;
}

export const TimelinePhasesSection: React.FC<TimelinePhasesSectionProps> = ({
  phases,
  onAddPhase,
  onEditPhase,
  onDeletePhase,
}) => {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Timeline Phases
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lịch trình chuẩn bị cho các giai đoạn Tết
          </p>
        </div>
        <button
          onClick={onAddPhase}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Phase
        </button>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20 text-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Chưa có giai đoạn nào được tạo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {phases
            .sort((a, b) => a.display_order - b.display_order)
            .map((phase) => (
              <div
                key={phase.id}
                className="group flex items-center gap-4 p-4 bg-background border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                {/* Trang trí icon bên trái cho đồng bộ BudgetOverview */}
                <div className="h-12 w-12 rounded-xl bg-planner-blue-light flex items-center justify-center text-planner-blue shrink-0 shadow-sm">
                  <Clock className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">
                    {phase.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(phase.start_date).toLocaleDateString("vi-VN")}
                    </span>
                    <span>-</span>
                    <span>
                      {new Date(phase.end_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Nút hành động hiện lên khi hover giống các section khác */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditPhase(phase)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Edit phase"
                  >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onDeletePhase(phase.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete phase"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>

                {/* Chỉ số thứ tự nhỏ ở góc (Display Order) */}
                <div className="absolute top-0 right-0 p-1">
                  <span className="text-[9px] font-bold text-muted-foreground/30 px-1.5">
                    #{phase.display_order}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
