export type ShoppingCategory = string;

export type ShoppingStatus = "pending" | "purchased";

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  is_system: boolean | null;
  allocated?: number; // <-- THÊM DÒNG NÀY VÀO LÀ HẾT BÁO ĐỎ
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
  timelinePhaseId?: string; // Add timeline phase ID
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
