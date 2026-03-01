import type { Category } from "../types/dashboard.types";
import {
  ShoppingCart,
  Gift,
  Sparkles,
  Package,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";

// Add this export
export const ICON_MAP = {
  ShoppingCart,
  Gift,
  Sparkles,
  Package,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food",
    icon: "ShoppingCart",
    colorClass: "text-planner-green", // Cái này dùng cho Tailwind class (OK)
    bgClass: "bg-planner-green/20",
    percent: "40%",
    is_system: true,
    allocated: 0,
    isDefault: false,
    // SỬA TẠI ĐÂY: Đổi từ tên class sang mã Hex
    color: "#10b981",
    allocated_budget: 0,
    tet_config: { id: 0 },
    transactions: [
      {
        id: "tx-f1",
        name: "Buy ingredients for spicy noodles",
        method: "Cash",
        date: "2026-02-15",
        amount: "150,000",
        isIncome: false,
        iconText: "MC",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      // ...
    ],
  },
  {
    id: "gift",
    name: "Gift",
    icon: "Gift",
    colorClass: "text-planner-pink",
    bgClass: "bg-planner-pink/20",
    percent: "30%",
    is_system: true,
    allocated: 0,
    isDefault: false,
    color: "#ec4899", // Sửa thành mã Hex của planner-pink
    allocated_budget: 0,
    tet_config: { id: 0 },
    transactions: [
      /* ... */
    ],
  },
  {
    id: "decoration",
    name: "Decoration",
    icon: "Sparkles",
    colorClass: "text-planner-purple",
    bgClass: "bg-planner-purple/20",
    percent: "15%",
    is_system: true,
    allocated: 0,
    isDefault: false,
    color: "#a855f7", // Sửa thành mã Hex của planner-purple
    allocated_budget: 0,
    tet_config: { id: 0 },
    transactions: [
      /* ... */
    ],
  },
  {
    id: "other",
    name: "Other",
    icon: "Package",
    colorClass: "text-planner-blue",
    bgClass: "bg-planner-blue/20",
    percent: "15%",
    is_system: true,
    allocated: 0,
    isDefault: false,
    color: "#3b82f6", // Sửa thành mã Hex của planner-blue
    allocated_budget: 0,
    tet_config: { id: 0 },
    transactions: [
      /* ... */
    ],
  },
];
