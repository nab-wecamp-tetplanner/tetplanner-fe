export type ShoppingCategory = string;

export type ShoppingStatus = "pending" | "purchased";

export interface CustomCategory {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class like "planner-blue"
  isDefault: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  price: number;
  quantity: number;
  dueDate: string; // ISO date string
  status: ShoppingStatus;
  notes?: string;
}

export interface Budget {
  total: number;
  used: number;
}

export interface CategorySummary {
  category: ShoppingCategory;
  total: number;
  itemCount: number;
  icon: string;
  color: string;
  bgColor: string;
}
