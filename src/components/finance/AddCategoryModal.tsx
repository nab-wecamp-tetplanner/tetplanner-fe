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
} from "lucide-react";
import type { CustomCategory } from "../../types/shopping.types";
import { ICON_MAP, COLOR_CONFIG } from "../../constants/finance";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<CustomCategory, "id" | "isDefault">) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Package");
  const [selectedColor, setSelectedColor] = useState("planner-blue");

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
    { name: "Blue", value: "planner-blue" },
    { name: "Pink", value: "planner-pink" },
    { name: "Purple", value: "planner-purple" },
    { name: "Green", value: "planner-green" },
    { name: "Amber", value: "planner-amber" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setName("");
      setSelectedIcon("Package");
      setSelectedColor("planner-blue");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-xl text-foreground">
            Add new category
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electronics, Clothing"
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              autoFocus
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Choose icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableIcons.map((iconItem) => {
                const Icon = iconItem.icon;
                const isSelected = selectedIcon === iconItem.name;
                const config = COLOR_CONFIG[selectedColor];
                return (
                  <button
                    key={iconItem.name}
                    type="button"
                    onClick={() => setSelectedIcon(iconItem.name)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${config.iconBg} border-${selectedColor}`
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Choose color
            </label>
            <div className="flex gap-2">
              {availableColors.map((colorItem) => {
                const config = COLOR_CONFIG[colorItem.value];
                const isSelected = selectedColor === colorItem.value;
                return (
                  <button
                    key={colorItem.value}
                    type="button"
                    onClick={() => setSelectedColor(colorItem.value)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${config.tokenBg} ${
                      isSelected
                        ? `border-${colorItem.value} ring-2 ring-${colorItem.value}/30`
                        : "border-transparent"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full ${config.iconBg} mx-auto`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl ${COLOR_CONFIG[selectedColor].iconBg} flex items-center justify-center`}
              >
                {React.createElement(ICON_MAP[selectedIcon] || Package, {
                  className: "w-5 h-5 text-primary-foreground",
                })}
              </div>
              <span className="font-medium text-foreground">
                {name || "Category name"}
              </span>
            </div>
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
              disabled={!name.trim()}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
