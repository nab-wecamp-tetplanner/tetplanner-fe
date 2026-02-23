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
import type { CustomCategory } from "../types/shopping.types";

export const DEFAULT_CATEGORIES: CustomCategory[] = [
  {
    id: "food",
    name: "Food",
    icon: "ShoppingCart",
    color: "planner-green",
    isDefault: true,
  },
  {
    id: "gift",
    name: "Gift",
    icon: "Gift",
    color: "planner-pink",
    isDefault: true,
  },
  {
    id: "decoration",
    name: "Decoration",
    icon: "Sparkles",
    color: "planner-purple",
    isDefault: true,
  },
  {
    id: "other",
    name: "Other",
    icon: "Package",
    color: "planner-blue",
    isDefault: true,
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
