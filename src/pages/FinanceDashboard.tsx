import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Gift,
  Sparkles,
  Package,
  Search,
  Calendar,
  Edit,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  TrendingUp,
  X,
  Plus,
} from "lucide-react";
import { ProgressRing } from "../components/ProgressRing";
import { AddPhaseModal } from "../components/finance/AddPhaseModal";
import financeApi from "../services/financeApi";
import apiClient from "../services/apiClient";
import type {
  ShoppingItem,
  ShoppingCategory,
  Budget,
  CategorySummary,
  CustomCategory,
} from "../types/shopping.types";
import type { TimelinePhase } from "../types/timeline.types";

// ==========================================
// CONSTANTS
// ==========================================

const DEFAULT_CATEGORIES: CustomCategory[] = [
  {
    id: "food",
    name: "Food",
    icon: "ShoppingCart",
    color: "planner-blue",
    isDefault: true,
  },
  {
    id: "gift",
    name: "Gift",
    icon: "Gift",
    color: "planner-pink",
    isDefault: true,
  },
  {
    id: "decoration",
    name: "Decoration",
    icon: "Sparkles",
    color: "planner-purple",
    isDefault: true,
  },
  {
    id: "other",
    name: "Other",
    icon: "Package",
    color: "planner-green",
    isDefault: true,
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingCart,
  Gift,
  Sparkles,
  Package,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
};

const COLOR_CONFIG: Record<
  string,
  {
    tokenColor: string;
    tokenBg: string;
    tokenBorder: string;
    iconBg: string;
  }
> = {
  "planner-blue": {
    tokenColor: "text-planner-blue",
    tokenBg: "bg-planner-blue-light",
    tokenBorder: "border-planner-blue/20",
    iconBg: "bg-planner-blue",
  },
  "planner-pink": {
    tokenColor: "text-planner-pink",
    tokenBg: "bg-planner-pink-light",
    tokenBorder: "border-planner-pink/20",
    iconBg: "bg-planner-pink",
  },
  "planner-purple": {
    tokenColor: "text-planner-purple",
    tokenBg: "bg-planner-purple-light",
    tokenBorder: "border-planner-purple/20",
    iconBg: "bg-planner-purple",
  },
  "planner-green": {
    tokenColor: "text-planner-green",
    tokenBg: "bg-planner-green-light",
    tokenBorder: "border-planner-green/20",
    iconBg: "bg-planner-green",
  },
  "planner-amber": {
    tokenColor: "text-planner-amber",
    tokenBg: "bg-planner-amber-light",
    tokenBorder: "border-planner-amber/20",
    iconBg: "bg-planner-amber",
  },
};

// ==========================================
// UTILITIES
// ==========================================

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

// ==========================================
// SUB-COMPONENTS
// ==========================================

// interface PageHeaderProps {
//   onAddCategory: () => void;
// }

// const PageHeader: React.FC<PageHeaderProps> = ({ onAddCategory }) => (
//   <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-8">
//     <div>
//       <p className="text-sm font-medium text-primary mb-1 tracking-wide uppercase">
//         Budget Planner
//       </p>
//       <h1 className="text-4xl font-serif text-foreground mb-1">
//         Shopping Manager
//       </h1>
//       <p className="text-muted-foreground text-sm">
//         Track expenses and manage Tet shopping budget
//       </p>
//     </div>
//     <div className="mt-4 md:mt-0 flex items-center gap-2">
//       <button
//         onClick={onAddCategory}
//         className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl hover:bg-muted transition-colors font-medium text-sm"
//       >
//         <FolderPlus className="w-4 h-4" />
//         Add category
//       </button>
//       <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-sm">
//         <Plus className="w-4 h-4" />
//         Add item
//       </button>
//     </div>
//   </div>
// );

interface BudgetOverviewProps {
  budget: Budget;
  itemCount: number;
  purchasedCount: number;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budget,
  itemCount,
  purchasedCount,
}) => {
  const percentage = (budget.used / budget.total) * 100;
  const remaining = budget.total - budget.used;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Main budget card */}
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <ProgressRing percentage={percentage} />
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-xl text-foreground mb-4">
              Budget overview
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Total budget
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(budget.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Spent
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(budget.used)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Remaining
                </p>
                <p className="text-lg font-bold text-accent">
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex flex-col gap-4">
        <div className="flex-1 bg-card rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-planner-amber-light flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-planner-amber" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Total items
            </p>
            <p className="text-2xl font-bold text-foreground">{itemCount}</p>
          </div>
        </div>
        <div className="flex-1 bg-card rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-planner-green-light flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-planner-green" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Purchased
            </p>
            <p className="text-2xl font-bold text-foreground">
              {purchasedCount}/{itemCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CategoryCardsProps {
  categorySummaries: CategorySummary[];
  categories: CustomCategory[];
}

const CategoryCards: React.FC<CategoryCardsProps> = ({
  categorySummaries,
  categories,
}) => (
  <div
    className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
    style={{ animationDelay: "0.2s" }}
  >
    {categorySummaries.map((summary) => {
      const category = categories.find((c) => c.name === summary.category);
      if (!category) return null;

      const Icon = ICON_MAP[category.icon] || Package;
      const config = COLOR_CONFIG[category.color] || COLOR_CONFIG["planner-green"];

      return (
        <div
          key={summary.category}
          className="group bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`h-10 w-10 rounded-xl ${config.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}
            >
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.tokenBg} ${config.tokenColor} border ${config.tokenBorder}`}
            >
              {summary.itemCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mb-0.5">
            {summary.category}
          </p>
          <p className={`text-xl font-bold ${config.tokenColor}`}>
            {formatCurrency(summary.total)}
          </p>
        </div>
      );
    })}
  </div>
);

interface ShoppingListProps {
  items: ShoppingItem[];
  categories: CustomCategory[];
  onAddItem: () => void;
  onToggleStatus: (itemId: string, currentStatus: string) => void;
  onDeleteItem: (itemId: string) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ 
  items, 
  categories,
  onAddItem,
  onToggleStatus,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    ShoppingCategory | "All"
  >("All");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, filterCategory]);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-foreground">
              Shopping list
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredItems.length} items
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddItem}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 w-44"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value as ShoppingCategory | "All")
              }
              className="px-3 py-2 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="All">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {filteredItems.map((item) => {
          const category = categories.find((c) => c.name === item.category);
          const Icon = category ? ICON_MAP[category.icon] || Package : Package;
          const config = category
            ? COLOR_CONFIG[category.color] || COLOR_CONFIG["planner-green"]
            : COLOR_CONFIG["planner-green"];
          const total = item.price * item.quantity;
          const isPurchased = item.status === "purchased";

          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors ${isPurchased ? "opacity-70" : ""}`}
            >
              {/* Status indicator */}
              <button
                onClick={() => onToggleStatus(item.id, item.status)}
                className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isPurchased ? "bg-accent border-accent" : "border-border hover:border-primary"}`}
              >
                {isPurchased && (
                  <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                )}
              </button>

              {/* Category icon */}
              <div
                className={`shrink-0 h-9 w-9 rounded-lg ${config.tokenBg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${config.tokenColor}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium text-foreground text-sm ${isPurchased ? "line-through" : ""}`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${config.tokenBg} ${config.tokenColor} font-medium`}
                  >
                    {item.category}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-lg shrink-0">
                x{item.quantity}
              </span>

              {/* Due date */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(item.dueDate)}
              </div>

              {/* Status badge */}
              <div className="hidden md:block shrink-0">
                {isPurchased ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-planner-green-light px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    Purchased
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-planner-amber bg-planner-amber-light px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </div>

              {/* Total */}
              <span className="font-bold text-sm text-foreground shrink-0 w-28 text-right">
                {formatCurrency(total)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">No items found</p>
            <p className="text-muted-foreground text-sm">
              Try changing your filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// ADD ITEM MODAL
// ==========================================

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<ShoppingItem, "id">) => void;
  categories: CustomCategory[];
  phases: TimelinePhase[];  // Add phases
  defaultPhaseId?: string | null;  // Add default phase
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  phases,  // Receive phases
  defaultPhaseId,  // Receive default phase
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("");
  const [phase, setPhase] = useState("");  // Add phase state
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (isOpen && categories.length > 0) {
      setCategory(categories[0].id); // Lưu ID thay vì name
    }
    if (isOpen && defaultPhaseId) {
      setPhase(defaultPhaseId);  // Set default phase
    }
  }, [isOpen, categories, defaultPhaseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    onAdd({
      name: name.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity) || 1,
      category: category || categories[0]?.id || "other", // Dùng ID
      status: "pending",
      dueDate,
      timelinePhaseId: phase,  // Add phase to item data
    });

    // Reset form
    setName("");
    setPrice("");
    setQuantity("1");
    setCategory(categories[0]?.id || ""); // Reset về ID
    setPhase(defaultPhaseId || "");  // Reset phase
    setDueDate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-xl text-foreground">
            Add shopping item
          </h2>
          <button
            onClick={onClose}
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
                  {p.name} ({new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()})
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
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-sm"
            >
              Add item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// ADD CATEGORY MODAL
// ==========================================

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<CustomCategory, "id" | "isDefault">) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
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
                {React.createElement(
                  ICON_MAP[selectedIcon] || Package,
                  { className: "w-5 h-5 text-primary-foreground" }
                )}
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

// ==========================================
// MAIN
// ==========================================

export default function FinanceDashboard() {
  // State
  const [tetConfigId, setTetConfigId] = useState<string | null>(null);  // UUID string
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budget, setBudget] = useState<Budget>({ total: 0, used: 0 });
  const [categories, setCategories] = useState<CustomCategory[]>(DEFAULT_CATEGORIES);
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [defaultPhaseId, setDefaultPhaseId] = useState<string | null>(null);  // Timeline phase for shopping items
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TimelinePhase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tet-config và data khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Bước 1: Lấy danh sách tet-configs của user
        const configs = await apiClient.tetConfigs.getMyConfigs();
        
        console.log("Existing configs:", configs);
        
        // Log chi tiết config để debug
        configs.forEach(c => {
          console.log(`Config ${c.id}: ${c.name}, year: ${c.year}, budget: ${c.total_budget}`);
        });
        
        let configId: string;  // UUID string
        
        // TEMPORARY FIX: Luôn tạo config mới để test
        // TODO: Sau khi backend fix, đổi lại logic dùng config cũ
        const newConfig = await apiClient.tetConfigs.create({
          year: 2025,
          name: `Tết ${new Date().getTime()}`, // Unique name
          total_budget: 5000000,
        });
        console.log("Created new config for testing:", newConfig);
        console.log("newConfig.id type:", typeof newConfig.id, "value:", newConfig.id);
        
        // Backend returns UUID string - use directly
        configId = newConfig.id;
        
        console.log("Using configId:", configId, "type:", typeof configId);
        
        if (!configId) {
          throw new Error(`Invalid config ID: ${newConfig.id}`);
        }

        setTetConfigId(configId);

        // Bước 2: Fetch budget, items, categories với tet_config_id đúng
        // Wrap trong try-catch riêng để handle lỗi 500 từ backend
        let budgetData = { total: 5000000, used: 0, remaining: 5000000, percentageUsed: 0, warningLevel: 'ok', categories: [] };
        let itemsData: ShoppingItem[] = [];
        let categoriesData: any[] = [];

        try {
          budgetData = await financeApi.getBudget(configId);
        } catch (err) {
          console.warn("Failed to fetch budget, using default:", err);
        }

        try {
          itemsData = await financeApi.getItems(configId);
        } catch (err) {
          console.warn("Failed to fetch items, using empty:", err);
        }

        try {
          categoriesData = await financeApi.getCategories(configId);
          console.log("Backend categories:", categoriesData);
        } catch (err) {
          console.warn("Failed to fetch categories, using empty:", err);
        }

        // Fetch timeline phases
        let phasesData: TimelinePhase[] = [];
        try {
          phasesData = await apiClient.get(`/timeline-phases?tet_config_id=${configId}`);
          console.log("Timeline phases:", phasesData);
          setPhases(phasesData);
          
          if (phasesData && phasesData.length > 0) {
            // Set first phase as default
            setDefaultPhaseId(phasesData[0].id);
          }
        } catch (err) {
          console.warn("Failed to fetch timeline phases:", err);
        }

        // Update state
        setBudget({ total: budgetData.total, used: budgetData.used });
        setItems(itemsData);
        
        // Merge backend categories với default categories
        const backendCategories: CustomCategory[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || "Package",
          color: cat.color || "planner-blue",
          isDefault: false,
        }));
        setCategories([...DEFAULT_CATEGORIES, ...backendCategories]);

      } catch (err) {
        console.error("Failed to fetch finance data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const purchasedCount = useMemo(
    () => items.filter((i) => i.status === "purchased").length,
    [items],
  );

  const categorySummaries = useMemo<CategorySummary[]>(() => {
    return categories.map((category) => {
      const categoryItems = items.filter((item) => item.category === category.name);
      const total = categoryItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const config = COLOR_CONFIG[category.color] || COLOR_CONFIG["planner-green"];
      return {
        category: category.name,
        total,
        itemCount: categoryItems.length,
        icon: category.icon,
        color: config.tokenColor,
        bgColor: config.tokenBg,
      };
    });
  }, [items, categories]);

  const handleAddCategory = (newCategory: Omit<CustomCategory, "id" | "isDefault">) => {
    const category: CustomCategory = {
      ...newCategory,
      id: `custom-${Date.now()}`,
      isDefault: false,
    };
    setCategories((prev) => [...prev, category]);
  };

  const handleAddItem = async (newItem: Omit<ShoppingItem, "id">) => {
    if (!tetConfigId) return;
    
    // Get phase ID from item or use default
    const phaseId = newItem.timelinePhaseId || defaultPhaseId;
    
    if (!phaseId) {
      alert("Please create a timeline phase first!");
      return;
    }
    
    try {
      // Map frontend category (default ID or backend UUID) to backend UUID
      let mappedItem = { ...newItem };
      
      // If user selected default category (food, gift, decoration, other)
      // Find matching backend category by name
      if (newItem.category && !newItem.category.includes('-')) {
        const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === newItem.category);
        if (defaultCat) {
          // Find backend category with same name
          const backendCat = categories.find(c => 
            c.name.toLowerCase() === defaultCat.name.toLowerCase() && !c.isDefault
          );
          if (backendCat) {
            mappedItem.category = backendCat.id; // Use backend UUID
            console.log(`Mapped category "${defaultCat.name}" to UUID: ${backendCat.id}`);
          } else {
            console.warn(`No backend category found for "${defaultCat.name}"`);
            // Create category in backend first
            const created = await financeApi.addCategory(tetConfigId, {
              name: defaultCat.name,
              icon: defaultCat.icon,
              color: defaultCat.color,
              allocated: 0
            });
            mappedItem.category = created.id;
            console.log(`Created category "${defaultCat.name}" with UUID: ${created.id}`);
          }
        }
      }
      
      const created = await financeApi.addItem(tetConfigId, mappedItem, phaseId);
      setItems((prev) => [...prev, created]);
      
      // Refetch budget để update used amount
      const budgetData = await financeApi.getBudget(tetConfigId);
      setBudget({ total: budgetData.total, used: budgetData.used });
      
      setIsAddItemModalOpen(false);  // Close modal on success
    } catch (err: any) {
      console.error("Failed to add item:", err);
      console.error("Error response:", err.response?.data);
      alert(`Failed to add item: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggleStatus = async (itemId: string, currentStatus: string) => {
    if (!tetConfigId) return;
    
    try {
      const newPurchased = currentStatus !== "purchased";
      const result = await financeApi.toggleItemStatus(itemId, newPurchased, tetConfigId);
      
      // Update item and budget
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? result.item : item))
      );
      setBudget({ total: result.budget.total, used: result.budget.used });
    } catch (err) {
      console.error("Failed to toggle item status:", err);
      alert("Failed to update item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!tetConfigId) return;
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await financeApi.deleteItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      
      // Refetch budget
      const budgetData = await financeApi.getBudget(tetConfigId);
      setBudget({ total: budgetData.total, used: budgetData.used });
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  // ==========================================
  // TIMELINE PHASE HANDLERS
  // ==========================================

  const handleAddPhase = async (phaseData: Omit<TimelinePhase, "id" | "tet_config_id">) => {
    if (!tetConfigId) return;
    
    try {
      const newPhase = await apiClient.post('/timeline-phases', {
        ...phaseData,
        tet_config_id: tetConfigId,
      });
      
      console.log("Created phase:", newPhase);
      
      // Add to phases list
      setPhases((prev) => [...prev, newPhase]);
      
      // If this is the first phase, set it as default
      if (phases.length === 0) {
        setDefaultPhaseId(newPhase.id);
      }
      
      setIsAddPhaseModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create phase:", err);
      alert(`Failed to create phase: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdatePhase = async (phaseData: Omit<TimelinePhase, "id" | "tet_config_id">) => {
    if (!editingPhase) return;
    
    try {
      const updatedPhase = await apiClient.patch(`/timeline-phases/${editingPhase.id}`, phaseData);
      
      console.log("Updated phase:", updatedPhase);
      
      // Update in phases list
      setPhases((prev) =>
        prev.map((p) => (p.id === editingPhase.id ? updatedPhase : p))
      );
      
      setIsAddPhaseModalOpen(false);
      setEditingPhase(null);
    } catch (err: any) {
      console.error("Failed to update phase:", err);
      alert(`Failed to update phase: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm("Are you sure you want to delete this timeline phase? Items in this phase will need to be reassigned.")) return;
    
    try {
      await apiClient.delete(`/timeline-phases/${phaseId}`);
      
      console.log("Deleted phase:", phaseId);
      
      // Remove from phases list
      setPhases((prev) => prev.filter((p) => p.id !== phaseId));
      
      // If this was the default phase, set a new default
      if (defaultPhaseId === phaseId && phases.length > 1) {
        const remainingPhases = phases.filter((p) => p.id !== phaseId);
        setDefaultPhaseId(remainingPhases[0]?.id || null);
      }
    } catch (err: any) {
      console.error("Failed to delete phase:", err);
      alert(`Failed to delete phase: ${err.response?.data?.message || err.message}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BudgetOverview
          budget={budget}
          itemCount={items.length}
          purchasedCount={purchasedCount}
        />
        
        {/* Timeline Phases Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-medium text-foreground">
              Timeline Phases
            </h2>
            <button
              onClick={() => setIsAddPhaseModalOpen(true)}
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
                        onClick={() => {
                          setEditingPhase(phase);
                          setIsAddPhaseModalOpen(true);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit phase"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeletePhase(phase.id)}
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
        
        <CategoryCards categorySummaries={categorySummaries} categories={categories} />
        <ShoppingList 
          items={items} 
          categories={categories}
          onAddItem={() => setIsAddItemModalOpen(true)}
          onToggleStatus={handleToggleStatus}
          onDeleteItem={handleDeleteItem}
        />
      </main>

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
        categories={categories}
        phases={phases}  // Pass phases
        defaultPhaseId={defaultPhaseId}  // Pass default phase
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAdd={handleAddCategory}
      />
      
      <AddPhaseModal
        isOpen={isAddPhaseModalOpen}
        onClose={() => {
          setIsAddPhaseModalOpen(false);
          setEditingPhase(null);
        }}
        onSave={editingPhase ? handleUpdatePhase : handleAddPhase}
        editingPhase={editingPhase}
      />
    </div>
  );
}
