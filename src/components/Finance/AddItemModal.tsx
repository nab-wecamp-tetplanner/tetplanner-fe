/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  Tag,
  Banknote,
  Hash,
  Layers,
  Clock,
  Calendar,
  ChevronDown,
  Plus,
} from "lucide-react";
import type { ShoppingItem } from "../../types/shopping.types";
import type { Timeline } from "../../types/timeline.types";
import type { Category } from "../../types/dashboard.types";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<ShoppingItem, "id">) => void;
  categories: Category[];
  phases: Timeline[];
  defaultPhaseId?: string | null;
  initialData?: ShoppingItem;
  onQuickAddCategory?: () => void;
  onQuickAddPhase?: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  phases,
  defaultPhaseId,
  initialData,
  onQuickAddCategory,
  onQuickAddPhase,
}) => {
  // KHỞI TẠO STATE TRỰC TIẾP (Bỏ useEffect để tránh lỗi cascading render)
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [quantity, setQuantity] = useState(
    initialData?.quantity?.toString() || "1",
  );
  const [category, setCategory] = useState(
    initialData?.category || (categories.length > 0 ? categories[0].id : ""),
  );
  const [phase, setPhase] = useState(
    initialData?.timelinePhaseId || defaultPhaseId || "",
  );
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? initialData?.dueDate.split("T")[0] : "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    onAdd({
      name: name.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity) || 1,
      category: category || categories[0]?.id || "other",
      status: initialData?.status || "pending",
      dueDate,
      timelinePhaseId: phase,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      {/* KHUNG GỐC CỦA BẠN - GIỮ NGUYÊN CLASS */}
      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl text-foreground">
              {initialData ? "Edit Item" : "Add Item"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Item Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Tag className="w-4 h-4 text-primary" /> Item name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sticky rice cake"
              className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          {/* Price & Quantity - DÙNG LẠI CLASS PLANNER-X CỦA BẠN */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Banknote className="w-4 h-4 text-planner-green" /> Price (VND)
                *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150000"
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-planner-green/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Hash className="w-4 h-4 text-planner-amber" /> Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-planner-amber/20"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Layers className="w-4 h-4  text-planner-purple" /> Category
              </label>
              {/* Nút + nhỏ mờ */}
              <button
                type="button"
                onClick={onQuickAddCategory}
                className="p-0.5 rounded-full bg-planner-purple/10 hover:bg-planner-purple/20 text-planner-purple/40 hover:text-planner-purple transition-all duration-300"
                title="Quick add category"
              >
                <Plus className="w-2.5 h-2.5" strokeWidth={3} />
              </button>
            </div>

            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-planner-purple/20 pr-10 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Phase */}
          <div className="space-y-2">
            {/* Tương tự cho Timeline Phase */}
            <div className="flex items-center gap-2 px-1">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Clock className="w-4 h-4 text-planner-blue" /> Timeline Phase *
              </label>

              <button
                type="button"
                onClick={onQuickAddPhase}
                className="p-0.5 rounded-full bg-planner-blue/10 hover:bg-planner-blue/20 text-planner-blue/40 hover:text-planner-blue transition-all duration-300 translate-y-[1px]"
                title="Quick add phase"
              >
                <Plus className="w-2.5 h-2.5" strokeWidth={4} />
              </button>
            </div>

            <div className="relative">
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-planner-blue/20 pr-10 outline-none"
                required
              >
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Calendar className="w-4 h-4 text-planner-pink" /> Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-planner-pink/20"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-border text-foreground rounded-2xl hover:bg-muted font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 font-bold text-sm shadow-lg shadow-primary/20"
            >
              {initialData ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
