import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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
      // Editing existing phase
      setName(editingPhase.name);
      setStartDate(editingPhase.start_date.split('T')[0]);  // Extract date part
      setEndDate(editingPhase.end_date.split('T')[0]);
      setDisplayOrder(String(editingPhase.display_order));
    } else if (isOpen) {
      // Creating new phase - reset form
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

    // Reset form
    setName("");
    setStartDate("");
    setEndDate("");
    setDisplayOrder("1");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-xl text-foreground">
            {editingPhase ? "Edit Timeline Phase" : "Add Timeline Phase"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Phase Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phase Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Shopping, Preparation"
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              autoFocus
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="1"
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              min="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lower numbers appear first
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-xl hover:bg-muted transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !startDate || !endDate}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingPhase ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
