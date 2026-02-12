import { Header } from "../components/Header";
import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Gift,
  Sparkles,
  Package,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { ProgressRing } from "../components/ProgressRing";
import type {
  ShoppingItem,
  ShoppingCategory,
  Budget,
  CategorySummary,
} from "../types/shopping.types";

// ==========================================
// CONSTANTS
// ==========================================

const CATEGORY_CONFIG: Record<
  ShoppingCategory,
  {
    icon: React.ElementType;
    tokenColor: string;
    tokenBg: string;
    tokenBorder: string;
    iconBg: string;
  }
> = {
  Food: {
    icon: ShoppingCart,
    tokenColor: "text-planner-blue",
    tokenBg: "bg-planner-blue-light",
    tokenBorder: "border-planner-blue/20",
    iconBg: "bg-planner-blue",
  },
  Gift: {
    icon: Gift,
    tokenColor: "text-planner-pink",
    tokenBg: "bg-planner-pink-light",
    tokenBorder: "border-planner-pink/20",
    iconBg: "bg-planner-pink",
  },
  Decoration: {
    icon: Sparkles,
    tokenColor: "text-planner-purple",
    tokenBg: "bg-planner-purple-light",
    tokenBorder: "border-planner-purple/20",
    iconBg: "bg-planner-purple",
  },
  Other: {
    icon: Package,
    tokenColor: "text-planner-green",
    tokenBg: "bg-planner-green-light",
    tokenBorder: "border-planner-green/20",
    iconBg: "bg-planner-green",
  },
};

const INITIAL_BUDGET: Budget = { total: 5000000, used: 0 };

const MOCK_ITEMS: ShoppingItem[] = [
  {
    id: "1",
    name: "Bánh chưng",
    category: "Food",
    price: 150000,
    quantity: 4,
    dueDate: "2026-02-15",
    status: "pending",
    notes: "Cần đặt trước",
  },
  {
    id: "2",
    name: "Mứt tết",
    category: "Food",
    price: 200000,
    quantity: 2,
    dueDate: "2026-02-14",
    status: "pending",
  },
  {
    id: "3",
    name: "Hoa mai",
    category: "Decoration",
    price: 500000,
    quantity: 1,
    dueDate: "2026-02-10",
    status: "purchased",
  },
  {
    id: "4",
    name: "Lì xì đỏ",
    category: "Gift",
    price: 50000,
    quantity: 10,
    dueDate: "2026-02-16",
    status: "pending",
  },
  {
    id: "5",
    name: "Bánh kẹo",
    category: "Food",
    price: 300000,
    quantity: 3,
    dueDate: "2026-02-13",
    status: "pending",
  },
  {
    id: "6",
    name: "Giỏ quà",
    category: "Gift",
    price: 400000,
    quantity: 2,
    dueDate: "2026-02-12",
    status: "pending",
  },
  {
    id: "7",
    name: "Câu đối",
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

const PageHeader = () => (
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-8">
    <div>
      <p className="text-sm font-medium text-primary mb-1 tracking-wide uppercase">
        Budget Planner
      </p>
      <h1 className="text-4xl font-serif text-foreground mb-1">
        Shopping Manager
      </h1>
      <p className="text-muted-foreground text-sm">
        Theo dõi chi tiêu và quản lý ngân sách mua sắm Tết
      </p>
    </div>
    <button className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-sm">
      <Plus className="w-4 h-4" />
      Thêm mục
    </button>
  </div>
);

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
              Tổng quan ngân sách
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Tổng ngân sách
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(budget.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Đã dùng
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(budget.used)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Còn lại
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
              Tổng mục
            </p>
            <p className="text-2xl font-bold text-foreground">{itemCount}</p>
          </div>
        </div>
        <div className="flex-1 bg-card rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-planner-green-light flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-planner-green" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Đã mua</p>
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
}

const CategoryCards: React.FC<CategoryCardsProps> = ({ categorySummaries }) => (
  <div
    className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
    style={{ animationDelay: "0.2s" }}
  >
    {categorySummaries.map((summary) => {
      const config = CATEGORY_CONFIG[summary.category];
      const Icon = config.icon;
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
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items }) => {
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
              Danh sách mua sắm
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredItems.length} mục
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
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
              <option value="All">Tất cả</option>
              <option value="Food">Thực phẩm</option>
              <option value="Gift">Quà tặng</option>
              <option value="Decoration">Trang trí</option>
              <option value="Other">Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {filteredItems.map((item) => {
          const config = CATEGORY_CONFIG[item.category];
          const Icon = config.icon;
          const total = item.price * item.quantity;
          const isPurchased = item.status === "purchased";

          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors ${isPurchased ? "opacity-70" : ""}`}
            >
              {/* Status indicator */}
              <button
                className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isPurchased ? "bg-accent border-accent" : "border-border hover:border-primary"}`}
              >
                {isPurchased && (
                  <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                )}
              </button>

              {/* Category icon */}
              <div
                className={`flex-shrink-0 h-9 w-9 rounded-lg ${config.tokenBg} flex items-center justify-center`}
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
              <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-lg flex-shrink-0">
                x{item.quantity}
              </span>

              {/* Due date */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(item.dueDate)}
              </div>

              {/* Status badge */}
              <div className="hidden md:block flex-shrink-0">
                {isPurchased ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-planner-green-light px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã mua
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-planner-amber bg-planner-amber-light px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    Chờ mua
                  </span>
                )}
              </div>

              {/* Total */}
              <span className="font-bold text-sm text-foreground flex-shrink-0 w-28 text-right">
                {formatCurrency(total)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
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
            <p className="text-foreground font-medium mb-1">
              Không tìm thấy mục nào
            </p>
            <p className="text-muted-foreground text-sm">Thử thay đổi bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN
// ==========================================

export default function FinanceDashboard() {
  const [items] = useState<ShoppingItem[]>(MOCK_ITEMS);
  const [budget, setBudget] = useState<Budget>(INITIAL_BUDGET);

  const budgetUsed = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  useEffect(() => {
    setBudget((prev) => ({ ...prev, used: budgetUsed }));
  }, [budgetUsed]);

  const purchasedCount = useMemo(
    () => items.filter((i) => i.status === "purchased").length,
    [items],
  );

  const categorySummaries = useMemo<CategorySummary[]>(() => {
    const categories: ShoppingCategory[] = [
      "Food",
      "Gift",
      "Decoration",
      "Other",
    ];
    return categories.map((category) => {
      const categoryItems = items.filter((item) => item.category === category);
      const total = categoryItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const config = CATEGORY_CONFIG[category];
      return {
        category,
        total,
        itemCount: categoryItems.length,
        icon: config.icon,
        color: config.tokenColor,
        bgColor: config.tokenBg,
      };
    });
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <PageHeader />
        <BudgetOverview
          budget={budget}
          itemCount={items.length}
          purchasedCount={purchasedCount}
        />
        <CategoryCards categorySummaries={categorySummaries} />
        <ShoppingList items={items} />
      </main>
    </div>
  );
}
