import React from "react";
import { Plus, Calendar, Edit, Trash2 } from "lucide-react";
import type { TimelinePhase } from "../../types/timeline.types";

interface TimelinePhasesSectionProps {
  phases: TimelinePhase[];
  onAddPhase: () => void;
  onEditPhase: (phase: TimelinePhase) => void;
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-medium text-foreground">
          Timeline Phases
        </h2>
        <button
          onClick={onAddPhase}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Phase
        </button>
      </div>
      
      {phases.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No timeline phases yet. Add one to start planning!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {phases
            .sort((a, b) => a.display_order - b.display_order)
            .map((phase) => (
              <div
                key={phase.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{phase.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(phase.start_date).toLocaleDateString()} - {new Date(phase.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
