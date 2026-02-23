import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ShoppingItem, CustomCategory } from "../../types/shopping.types";
import type { TimelinePhase } from "../../types/timeline.types";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<ShoppingItem, "id">) => void;
  categories: CustomCategory[];
  phases: TimelinePhase[];
  defaultPhaseId?: string | null;
  initialData?: ShoppingItem;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  phases,
  defaultPhaseId,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("");
  const [phase, setPhase] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Populate form when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Edit mode - populate with existing data
      setName(initialData.name || "");
      setPrice(initialData.price?.toString() || "");
      setQuantity(initialData.quantity?.toString() || "1");
      setCategory(initialData.category || "");
      setPhase(initialData.timelinePhaseId || "");
      // Convert ISO date to YYYY-MM-DD format
      const dateValue = initialData.dueDate
        ? initialData.dueDate.split("T")[0]
        : "";
      setDueDate(dateValue);
    } else {
      // Add mode - reset to defaults
      setName("");
      setPrice("");
      setQuantity("1");
      setCategory(categories.length > 0 ? categories[0].id : "");
      setPhase(defaultPhaseId || "");
      setDueDate("");
    }
  }, [isOpen, initialData?.id]); // Only depend on isOpen and item ID

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    onAdd({
      name: name.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity) || 1,
      category: category || categories[0]?.id || "other",
      status: initialData?.status || "pending", // Preserve status when editing
      dueDate,
      timelinePhaseId: phase,
    });

    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    if (!initialData) {
      setName("");
      setPrice("");
      setQuantity("1");
      setCategory(categories[0]?.id || "");
      setPhase(defaultPhaseId || "");
      setDueDate("");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-xl text-foreground">
            {initialData ? "Edit shopping item" : "Add shopping item"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Item name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sticky rice cake"
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              autoFocus
              required
            />
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price (VND) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150000"
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                min="1"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline Phase */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Timeline Phase *
            </label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              required
            >
              {phases.length === 0 && (
                <option value="">No phases available - create one first</option>
              )}
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({new Date(p.start_date).toLocaleDateString()} -{" "}
                  {new Date(p.end_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-sm"
            >
              {initialData ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
