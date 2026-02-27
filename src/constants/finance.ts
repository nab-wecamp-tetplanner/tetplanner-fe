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
import type { Category } from "../types/dashboard.types";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food",
    icon: "ShoppingCart",
    colorClass: "text-planner-green",
    bgClass: "bg-planner-green/20",
    percent: "40%",
    is_system: true,
    transactions: [
      {
        id: "tx-f1",
        name: "Mua đồ nấu mì cay",
        method: "Cash",
        date: "2026-02-15",
        amount: "150,000",
        isIncome: false,
        iconText: "MC",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        id: "tx-f2",
        name: "Cacao Latte & Trà sữa",
        method: "Momo",
        date: "2026-02-16",
        amount: "85,000",
        isIncome: false,
        iconText: "TS",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      }
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
    transactions: [
      {
        id: "tx-g1",
        name: "Quà Tết biếu Mẹ",
        method: "Transfer",
        date: "2026-02-10",
        amount: "2,000,000",
        isIncome: false,
        iconText: "QT",
        iconBg: "bg-pink-100",
        iconColor: "text-pink-600",
      },
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
    transactions: [
      {
        id: "tx-d1",
        name: "Chậu hoa Mai vàng",
        method: "Cash",
        date: "2026-02-12",
        amount: "800,000",
        isIncome: false,
        iconText: "HM",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
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
    transactions: [
      {
        id: "tx-o1",
        name: "Vé xe khách về Bến Tre",
        method: "Transfer",
        date: "2026-02-14",
        amount: "180,000",
        isIncome: false,
        iconText: "VX",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        id: "tx-o2",
        name: "Nhổ răng khôn",
        method: "Transfer",
        date: "2026-02-17",
        amount: "2,500,000",
        isIncome: false,
        iconText: "RK",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      }
    ],
  },
];
export const ICON_MAP: Record<string, any> = {
  ShoppingCart,
  Gift,
  Sparkles,
  Package,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
};

export const COLOR_CONFIG: Record<
  string,
  {
    iconBg: string;
    tokenBg: string;
    tokenColor: string;
    tokenBorder: string;
  }
> = {
  "planner-green": {
    iconBg: "bg-planner-green",
    tokenBg: "bg-planner-green-light",
    tokenColor: "text-planner-green",
    tokenBorder: "border-planner-green/20",
  },
  "planner-pink": {
    iconBg: "bg-planner-pink",
    tokenBg: "bg-planner-pink-light",
    tokenColor: "text-planner-pink",
    tokenBorder: "border-planner-pink/20",
  },
  "planner-purple": {
    iconBg: "bg-planner-purple",
    tokenBg: "bg-planner-purple-light",
    tokenColor: "text-planner-purple",
    tokenBorder: "border-planner-purple/20",
  },
  "planner-blue": {
    iconBg: "bg-planner-blue",
    tokenBg: "bg-planner-blue-light",
    tokenColor: "text-planner-blue",
    tokenBorder: "border-planner-blue/20",
  },
  "planner-amber": {
    iconBg: "bg-planner-amber",
    tokenBg: "bg-planner-amber-light",
    tokenColor: "text-planner-amber",
    tokenBorder: "border-planner-amber/20",
  },
};

// Generate consistent color based on category name/id
export const getCategoryColor = (categoryId: string | null): string => {
  if (!categoryId || categoryId === "") return "planner-blue";

  const colors = [
    "planner-green",
    "planner-pink",
    "planner-purple",
    "planner-blue",
    "planner-amber",
  ];

  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};
