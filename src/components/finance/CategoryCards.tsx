import React from "react";
import { Package, X, Pencil } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import type {
  CategorySummary,
  CustomCategory,
} from "../../types/shopping.types";
import { ICON_MAP, COLOR_CONFIG } from "../../constants/finance";

interface CategoryCardsProps {
  categorySummaries: CategorySummary[];
  categories: CustomCategory[];
  onDeleteCategory?: (categoryId: string) => void;
  onEditCategory?: (category: CustomCategory) => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  categorySummaries,
  categories,
  onDeleteCategory,
  onEditCategory,
}) => (
  <div
    className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
    style={{ animationDelay: "0.2s" }}
  >
    {categorySummaries.map((summary) => {
      const category = categories.find((c) => c.name === summary.category);
      if (!category) return null;

      const Icon = ICON_MAP[category.icon] || Package;
      const categoryColor = category.color || "#10b981";

      return (
        <div
          key={summary.category}
          className="group bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-200 cursor-pointer relative"
        >
          {/* Edit and Delete buttons for custom categories */}
          {!category.isDefault && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEditCategory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(category);
                  }}
                  className="p-1 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                </button>
              )}
              {onDeleteCategory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${category.name}" category?`)) {
                      onDeleteCategory(category.id);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-destructive" />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{ backgroundColor: `${categoryColor}40` }}
            >
              <Icon className="w-5 h-5" style={{ color: categoryColor }} />
            </div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
                borderColor: `${categoryColor}40`,
              }}
            >
              {summary.itemCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mb-0.5">
            {summary.category}
          </p>
          <p className="text-xl font-bold" style={{ color: categoryColor }}>
            {formatCurrency(summary.total)}
          </p>
        </div>
      );
    })}
  </div>
);
