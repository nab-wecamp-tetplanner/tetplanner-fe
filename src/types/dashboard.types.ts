import type { CategoryResponse } from "./categories.type";

export type Transaction = {
  id: string;
  name: string;
  method: string;
  date: string;
  amount: string;
  isIncome: boolean;
  iconText: string;
  iconBg: string;
  iconColor: string;
};

export interface Category extends CategoryResponse {
  // UI logic fields
  percent: string;
  colorClass: string;
  bgClass: string;
  transactions: Transaction[];

  // Aliases for compatibility with Shopping components
  allocated: number; // Maps from allocated_budget
  isDefault: boolean; // Maps from is_system
}

export type WeeklyTaskData = {
  week: string;
  tasksDone: number;
  tasksCreated: number;
  totalTasks: number;
};

export type WeeklyFinanceData = {
  week: string;
  income: number;
  expense: number;
};
