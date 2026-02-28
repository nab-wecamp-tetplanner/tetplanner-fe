import React from "react";
import { Package, X, Pencil } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import type { Category } from "../../types/dashboard.types"; // Thay CustomCategory bằng Category
import type { CategorySummary } from "../../types/shopping.types";
import { ICON_MAP } from "../../constants/finance";

interface CategoryCardsProps {
  categorySummaries: CategorySummary[];
  categories: Category[]; // Đổi Type ở đây
  onDeleteCategory?: (categoryId: string) => void;
  onEditCategory?: (category: Category) => void; // Đổi Type ở đây
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

      // Tính toán dữ liệu ngân sách
      const allocated = category.allocated || 0;
      const spent = summary.total;
      const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
      const isOverBudget = allocated > 0 && spent > allocated;

      return (
        <div
          key={summary.category}
          className="group bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden"
        >
          {/* Giữ nguyên nút Sửa/Xóa gốc */}
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
                    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài thẻ card

                    // BỎ COMMENT ĐOẠN NÀY:
                    // Gọi trực tiếp prop để kích hoạt Modal xác nhận ở file cha (FinanceDashboard)
                    onDeleteCategory(category.id);
                  }}
                  className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-destructive" />
                </button>
              )}
            </div>
          )}

          {/* Giữ nguyên phần Icon & Badge gốc */}
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

          {/* Giữ nguyên Tên danh mục */}
          <p className="text-xs text-muted-foreground font-medium mb-0.5">
            {summary.category}
          </p>

          {/* Giữ nguyên Giá tiền và thêm label nhỏ nếu có budget */}
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl font-bold" style={{ color: categoryColor }}>
              {formatCurrency(spent)}
            </p>
            {allocated > 0 && (
              <span
                className={`text-[9px] font-bold ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}
              >
                {Math.round(percentage)}%
              </span>
            )}
          </div>

          {/* CHỈ THÊM MỚI: Thanh tiến độ siêu mảnh nằm sát đáy thẻ */}
          {allocated > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20">
              <div
                className={`h-full transition-all duration-1000 ease-out ${isOverBudget ? "bg-destructive" : ""}`}
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: !isOverBudget ? categoryColor : undefined,
                }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);
