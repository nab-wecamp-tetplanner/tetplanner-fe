import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Gift,
  Sparkles,
  Package,
  Search,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  TrendingUp,
  X,
} from "lucide-react";
import { ProgressRing } from "../components/ProgressRing";
import type {
  ShoppingItem,
  ShoppingCategory,
  Budget,
  CategorySummary,
  CustomCategory,
} from "../types/shopping.types";

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

const INITIAL_BUDGET: Budget = { total: 5000000, used: 0 };

const MOCK_ITEMS: ShoppingItem[] = [
  {
    id: "1",
    name: "Sticky rice cake",
    category: "Food",
    price: 150000,
    quantity: 4,
    dueDate: "2026-02-15",
    status: "pending",
    notes: "Need to pre-order",
  },
  {
    id: "2",
    name: "Candied fruit",
    category: "Food",
    price: 200000,
    quantity: 2,
    dueDate: "2026-02-14",
    status: "pending",
  },
  {
    id: "3",
    name: "Apricot blossom",
    category: "Decoration",
    price: 500000,
    quantity: 1,
    dueDate: "2026-02-10",
    status: "purchased",
  },
  {
    id: "4",
    name: "Red envelopes",
    category: "Gift",
    price: 50000,
    quantity: 10,
    dueDate: "2026-02-16",
    status: "pending",
  },
  {
    id: "5",
    name: "Cookies & candies",
    category: "Food",
    price: 300000,
    quantity: 3,
    dueDate: "2026-02-13",
    status: "pending",
  },
  {
    id: "6",
    name: "Gift basket",
    category: "Gift",
    price: 400000,
    quantity: 2,
    dueDate: "2026-02-12",
    status: "pending",
  },
  {
    id: "7",
    name: "Couplets",
    category: "Decoration",
    price: 100000,
    quantity: 3,
    dueDate: "2026-02-11",
    status: "purchased",
  },
];

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
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, categories }) => {
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
                <button className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors">
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
  const [items] = useState<ShoppingItem[]>(MOCK_ITEMS);
  const [categories, setCategories] = useState<CustomCategory[]>(() => {
    const saved = localStorage.getItem("shopping-categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("shopping-categories", JSON.stringify(categories));
  }, [categories]);

  const budgetUsed = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const budget: Budget = useMemo(
    () => ({ total: INITIAL_BUDGET.total, used: budgetUsed }),
    [budgetUsed],
  );

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

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BudgetOverview
          budget={budget}
          itemCount={items.length}
          purchasedCount={purchasedCount}
        />
        <CategoryCards categorySummaries={categorySummaries} categories={categories} />
        <ShoppingList items={items} categories={categories} />
      </main>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAdd={handleAddCategory}
      />
    </div>
  );
}
