/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  X,
  ShoppingCart,
  Gift,
  Sparkles,
  Package,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  FolderOpen,
  CircleDollarSign,
  Palette,
  Layout,
} from "lucide-react";
import type { Category } from "../../types/dashboard.types";

// Interface để dọn sạch lỗi 'any' khi gửi data ra ngoài
interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  allocated: number;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: CategoryFormData) => void;
  initialData?: Category | null;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  initialData,
}) => {
  // --- GIỮ NGUYÊN CÁC HELPER CỦA BẠN ---
  const emojiToIconName: Record<string, string> = {
    "🛒": "ShoppingCart",
    "🎁": "Gift",
    "✨": "Sparkles",
    "📦": "Package",
    "📈": "TrendingUp",
    "📅": "Calendar",
    "✅": "CheckCircle2",
    "🕐": "Clock",
  };

  const getColorNameFromHex = (hex: string): string => {
    const colorMap: Record<string, string> = {
      "#3b82f6": "planner-blue",
      "#ec4899": "planner-pink",
      "#a855f7": "planner-purple",
      "#10b981": "planner-green",
      "#f59e0b": "planner-amber",
      "#14b8a6": "planner-teal",
      "#6366f1": "planner-indigo",
      "#f43f5e": "planner-rose",
      "#f97316": "planner-orange",
      "#64748b": "planner-slate",
    };
    return colorMap[hex] || "planner-blue";
  };

  // --- TÍNH TOÁN GIÁ TRỊ KHỞI TẠO (Thay thế useEffect) ---
  const getInitialColor = () => {
    if (!initialData) return "planner-blue";
    if (initialData.colorClass)
      return initialData.colorClass.replace("text-", "");
    if (initialData.color) return getColorNameFromHex(initialData.color);
    return "planner-blue";
  };

  // --- STATE KHỞI TẠO TRỰC TIẾP ---
  const [name, setName] = useState(initialData?.name || "");
  const [selectedIcon, setSelectedIcon] = useState(
    initialData
      ? emojiToIconName[initialData.icon] || initialData.icon || "Package"
      : "Package",
  );
  const [selectedColor, setSelectedColor] = useState(getInitialColor());
  const [allocatedBudget, setAllocatedBudget] = useState(
    initialData?.allocated?.toString() ||
      initialData?.allocated_budget?.toString() ||
      "",
  );

  const isEditMode = !!initialData;

  const availableIcons = [
    { name: "ShoppingCart", icon: ShoppingCart },
    { name: "Gift", icon: Gift },
    { name: "Sparkles", icon: Sparkles },
    { name: "Package", icon: Package },
    { name: "TrendingUp", icon: TrendingUp },
    { name: "Calendar", icon: Calendar },
    { name: "CheckCircle2", icon: CheckCircle2 },
    { name: "Clock", icon: Clock },
  ];

  const availableColors = [
    { name: "Blue", value: "planner-blue", hex: "#3b82f6" },
    { name: "Pink", value: "planner-pink", hex: "#ec4899" },
    { name: "Purple", value: "planner-purple", hex: "#a855f7" },
    { name: "Green", value: "planner-green", hex: "#10b981" },
    { name: "Amber", value: "planner-amber", hex: "#f59e0b" },
    { name: "Teal", hex: "#14b8a6", value: "planner-teal" },
    { name: "Indigo", hex: "#6366f1", value: "planner-indigo" },
    { name: "Rose", hex: "#f43f5e", value: "planner-rose" },
    { name: "Orange", hex: "#f97316", value: "planner-orange" },
    { name: "Slate", hex: "#64748b", value: "planner-slate" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const selectedColorHex =
        availableColors.find((c) => c.value === selectedColor)?.hex ||
        "#3b82f6";

      onAdd({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColorHex,
        allocated: allocatedBudget ? parseFloat(allocatedBudget) : 0,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl text-foreground">
              {isEditMode ? "Edit Category" : "Add Category"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Layout className="w-4 h-4 text-primary" /> Category name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electronics..."
              className="w-full px-4 py-2.5 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground">
              <CircleDollarSign className="w-4 h-4 text-planner-green" />{" "}
              Allocated budget
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <input
              type="number"
              value={allocatedBudget}
              onChange={(e) => setAllocatedBudget(e.target.value)}
              placeholder="Amount (VND)"
              className="w-full px-4 py-2.5 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-planner-green/20 transition-all"
            />
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Sparkles className="w-4 h-4 text-planner-amber" /> Choose icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableIcons.map((iconItem) => {
                  const Icon = iconItem.icon;
                  const isSelected = selectedIcon === iconItem.name;
                  return (
                    <button
                      key={iconItem.name}
                      type="button"
                      onClick={() => setSelectedIcon(iconItem.name)}
                      className={`p-2.5 rounded-2xl border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? `bg-primary/10 border-primary text-primary`
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Palette className="w-4 h-4 text-purple-500" /> Choose color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {availableColors.map((colorItem) => {
                const isSelected = selectedColor === colorItem.value;
                return (
                  <button
                    key={colorItem.value}
                    type="button"
                    onClick={() => setSelectedColor(colorItem.value)}
                    className={`group relative h-12 w-full rounded-2xl border-2 transition-all flex items-center justify-center ${
                      isSelected
                        ? "border-[#334155] shadow-sm"
                        : "border-transparent hover:border-slate-200"
                    }`}
                    style={{ backgroundColor: colorItem.hex + "15" }}
                  >
                    <div
                      className={`h-5 w-5 rounded-full transition-transform ${isSelected ? "scale-110" : "scale-100 group-hover:scale-105"}`}
                      style={{ backgroundColor: colorItem.hex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-border text-foreground rounded-2xl hover:bg-muted transition-all font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-all font-bold text-sm shadow-lg disabled:opacity-50"
            >
              {isEditMode ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
