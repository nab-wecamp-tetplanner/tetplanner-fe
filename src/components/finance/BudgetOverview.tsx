import React from "react";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { ProgressRing } from "../ProgressRing";
import type { Budget } from "../../types/shopping.types";

interface BudgetOverviewProps {
  budget: Budget;
  itemCount: number;
  purchasedCount: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
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
