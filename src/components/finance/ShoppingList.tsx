import React, { useState, useMemo } from "react";
import { Package, Search, Calendar, CheckCircle2, Clock, Edit2, Trash2, Plus } from "lucide-react";
import type { ShoppingItem, ShoppingCategory, CustomCategory } from "../../types/shopping.types";
import { ICON_MAP, COLOR_CONFIG } from "../../constants/finance";

interface ShoppingListProps {
  items: ShoppingItem[];
  categories: CustomCategory[];
  onAddItem: () => void;
  onToggleStatus: (itemId: string, currentStatus: string) => void;
  onDeleteItem: (itemId: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const ShoppingList: React.FC<ShoppingListProps> = ({ 
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
