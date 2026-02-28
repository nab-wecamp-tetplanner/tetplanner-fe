import React, { useState, useMemo } from "react";
import {
  Package,
  Search,
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { ShoppingItem } from "../../types/shopping.types";
import { ICON_MAP } from "../../constants/finance";
import type { Category } from "../../types/dashboard.types";

interface ShoppingListProps {
  items: ShoppingItem[];
  categories: Category[];
  onAddItem: () => void;
  onEditItem: (item: ShoppingItem) => void;
  onToggleStatus: (itemId: string, currentStatus: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  categories,
  onAddItem,
  onEditItem,
  onToggleStatus,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Logic lọc: So sánh ID thay vì Name để chính xác 100%
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = (item.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "All" ||
        String(item.category) === String(filterCategory);
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, filterCategory]);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
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
                className="pl-9 pr-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-44"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>

            {/* Dropdown - Giữ style rounded-xl cho đồng bộ */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-3 pr-8 py-2 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Items List - Giữ nguyên logic hiển thị của Medley */}
      <div className="divide-y divide-border">
        {filteredItems.map((item) => {
          // Tra cứu category động từ state
          const category = categories.find(
            (c) => String(c.id) === String(item.category),
          );
          const Icon = category ? ICON_MAP[category.icon] || Package : Package;
          const categoryColor = category?.color || "#94a3b8";
          const isPurchased = item.status === "purchased";
          const total = item.price * item.quantity;

          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors ${isPurchased ? "opacity-70" : ""}`}
            >
              <button
                onClick={() => onToggleStatus(item.id, item.status)}
                className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isPurchased ? "bg-planner-green border-planner-green" : "border-border hover:border-primary"}`}
              >
                {isPurchased && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>

              <div
                className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${categoryColor}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: categoryColor }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium text-foreground text-sm ${isPurchased ? "line-through text-muted-foreground" : ""}`}
                  >
                    {item.name}
                  </span>
                  {category && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: `${categoryColor}20`,
                        color: categoryColor,
                      }}
                    >
                      {category.name}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-lg shrink-0">
                x{item.quantity}
              </span>

              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(item.dueDate)}
              </div>

              <span className="font-bold text-sm text-foreground shrink-0 w-28 text-right">
                {formatCurrency(total)}
              </span>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => onEditItem(item)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
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
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">
              No items found matching your filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
