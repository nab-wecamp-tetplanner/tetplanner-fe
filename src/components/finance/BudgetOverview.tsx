import React from "react";
import { TrendingUp, CheckCircle2, Pencil, AlertTriangle } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { formatCurrency } from "../../utils/formatters";
import type { Budget } from "../../types/shopping.types";

interface BudgetOverviewProps {
  budget: Budget;
  itemCount: number;
  purchasedCount: number;
  onEditBudget: () => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budget,
  itemCount,
  purchasedCount,
  onEditBudget,
}) => {
  // Sửa lỗi NaN bằng cách kiểm tra budget.total
  const percentage = budget.total > 0 ? (budget.used / budget.total) * 100 : 0;
  const remaining = budget.total - budget.used;
  const isOverBudget = budget.used > budget.total; // Kiểm tra quá ngân sách

  return (
    <div className="space-y-4 mb-8">
      {/* Cảnh báo khi quá ngân sách */}
      {isOverBudget && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <p className="text-destructive text-sm font-bold">
            Cảnh báo: Bạn đã chi vượt ngân sách{" "}
            {formatCurrency(Math.abs(remaining))}!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <ProgressRing percentage={percentage > 100 ? 100 : percentage} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-foreground">
                  Budget overview
                </h2>
                <button
                  onClick={onEditBudget}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-primary"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
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
                  <p
                    className={`text-lg font-bold ${isOverBudget ? "text-destructive" : "text-primary"}`}
                  >
                    {formatCurrency(budget.used)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Remaining
                  </p>
                  <p
                    className={`text-lg font-bold ${isOverBudget ? "text-destructive" : "text-planner-amber"}`}
                  >
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
};
