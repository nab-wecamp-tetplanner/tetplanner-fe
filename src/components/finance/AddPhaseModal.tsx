import React, { useState, useEffect } from "react";
import { X, Calendar, Type, ListOrdered, Sparkles } from "lucide-react";
import type { TimelinePhase } from "../../types/timeline.types";

interface AddPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: Omit<TimelinePhase, "id" | "tet_config_id">) => void;
  editingPhase?: TimelinePhase | null;
}

export const AddPhaseModal: React.FC<AddPhaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPhase,
}) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [displayOrder, setDisplayOrder] = useState("1");

  useEffect(() => {
    if (isOpen && editingPhase) {
      setName(editingPhase.name);
      setStartDate(editingPhase.start_date.split("T")[0]);
      setEndDate(editingPhase.end_date.split("T")[0]);
      setDisplayOrder(String(editingPhase.display_order));
    } else if (isOpen) {
      setName("");
      setStartDate("");
      setEndDate("");
      setDisplayOrder("1");
    }
  }, [isOpen, editingPhase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;

    onSave({
      name: name.trim(),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      display_order: parseInt(displayOrder) || 1,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl text-foreground">
              {editingPhase ? "Edit Phase" : "Add Phase"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Phase Name Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground capitalize">
              <Type className="w-4 h-4 text-primary" />
              Phase name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Shopping, Decorations..."
              className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
              required
            />
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground capitalize">
                <Calendar className="w-4 h-4 text-planner-blue" />
                Start date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-planner-blue/20 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground capitalize">
                <Calendar className="w-4 h-4 text-planner-pink" />
                End date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-planner-pink/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Display Order Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground capitalize">
              <ListOrdered className="w-4 h-4 text-planner-amber" />
              Display order
            </label>
            <div className="relative">
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-planner-amber/20 transition-all"
                min="1"
              />
              <p className="text-[10px] text-muted-foreground mt-2 italic">
                * Lower numbers appear first in the list
              </p>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-border text-foreground rounded-2xl hover:bg-muted transition-all font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !startDate || !endDate}
              className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-all font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingPhase ? "Save Changes" : "Create Phase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
