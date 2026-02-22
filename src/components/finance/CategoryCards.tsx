import React from "react";
import { Package, X } from "lucide-react";
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
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  categorySummaries,
  categories,
  onDeleteCategory,
}) => (
  <div
    className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
    style={{ animationDelay: "0.2s" }}
  >
    {categorySummaries.map((summary) => {
      const category = categories.find((c) => c.name === summary.category);
      if (!category) return null;

      const Icon = ICON_MAP[category.icon] || Package;
      const config =
        COLOR_CONFIG[category.color] || COLOR_CONFIG["planner-green"];

      return (
        <div
          key={summary.category}
          className="group bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-200 cursor-pointer relative"
        >
          {/* Delete button for custom categories */}
          {!category.isDefault && onDeleteCategory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${category.name}" category?`)) {
                  onDeleteCategory(category.id);
                }
              }}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3.5 h-3.5 text-destructive" />
            </button>
          )}

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
