export type ShoppingCategory = "Food" | "Gift" | "Decoration" | "Other";

export type ShoppingStatus = "pending" | "purchased";

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
