import React, { useState, useMemo } from "react";
import { Header } from "../components/Header";
import {
  Plus,
  Minus,
  ArrowLeftRight,
  Search,
  X,
  Calendar,
  MoreVertical,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface ActionCardType {
  title: string;
  description: string;
  icon: React.ElementType;
  tokenColor: string;
  tokenBg: string;
  iconBg: string;
}

interface TransactionType {
  id: string;
  isDateGroupRow?: boolean;
  iconText?: string;
  iconBg?: string;
  iconColor?: string;
  name: string;
  category?: string;
  date?: string;
  amount: number;
  isIncome: boolean;
}

// ==========================================
// CONSTANTS
// ==========================================

const ACTION_CARDS: ActionCardType[] = [
  {
    title: "Add income",
    description: "Create an income manually",
    icon: Plus,
    tokenColor: "text-planner-green",
    tokenBg: "bg-planner-green-light",
    iconBg: "bg-planner-green",
  },
  {
    title: "Add expense",
    description: "Create an expense manually",
    icon: Minus,
    tokenColor: "text-planner-pink",
    tokenBg: "bg-planner-pink-light",
    iconBg: "bg-planner-pink",
  },
  {
    title: "Transfer money",
    description: "Select the amount and make a transfer",
    icon: ArrowLeftRight,
    tokenColor: "text-planner-blue",
    tokenBg: "bg-planner-blue-light",
    iconBg: "bg-planner-blue",
  },
];

const TRANSACTIONS: TransactionType[] = [
  {
    id: "g1",
    isDateGroupRow: true,
    name: "10/02/2026",
    amount: 0,
    isIncome: true,
  },
  {
    id: "2",
    iconText: "OR",
    iconBg: "bg-planner-purple-light",
    iconColor: "text-planner-purple",
    name: "Orlando Rodrigues",
    category: "Housing",
    date: "10/02/2026",
    amount: 750000,
    isIncome: true,
  },
  {
    id: "3",
    iconText: "OR",
    iconBg: "bg-planner-purple-light",
    iconColor: "text-planner-purple",
    name: "Orlando Rodrigues",
    category: "Housing",
    date: "10/02/2026",
    amount: 750000,
    isIncome: true,
  },
  {
    id: "4",
    iconText: "N",
    iconBg: "bg-planner-pink-light",
    iconColor: "text-planner-pink",
    name: "Netflix",
    category: "Entertainment",
    date: "09/02/2026",
    amount: 99000,
    isIncome: false,
  },
  {
    id: "5",
    iconText: "S",
    iconBg: "bg-planner-green-light",
    iconColor: "text-planner-green",
    name: "Spotify",
    category: "Entertainment",
    date: "09/02/2026",
    amount: 199000,
    isIncome: false,
  },
  {
    id: "g2",
    isDateGroupRow: true,
    name: "08/02/2026",
    amount: 0,
    isIncome: true,
  },
  {
    id: "7",
    iconText: "CA",
    iconBg: "bg-planner-blue-light",
    iconColor: "text-planner-blue",
    name: "Carl Andrew",
    category: "Education",
    date: "08/02/2026",
    amount: 400000,
    isIncome: true,
  },
  {
    id: "8",
    iconText: "CM",
    iconBg: "bg-planner-amber-light",
    iconColor: "text-planner-amber",
    name: "Carrefour Market",
    category: "Food",
    date: "07/02/2026",
    amount: 643300,
    isIncome: false,
  },
  {
    id: "9",
    iconText: "A",
    iconBg: "bg-muted",
    iconColor: "text-foreground",
    name: "Amazon",
    category: "Shopping",
    date: "06/02/2026",
    amount: 1479000,
    isIncome: false,
  },
  {
    id: "10",
    iconText: "Sh",
    iconBg: "bg-planner-green-light",
    iconColor: "text-planner-green",
    name: "Shopify",
    category: "Shopping",
    date: "05/02/2026",
    amount: 579800,
    isIncome: false,
  },
];

// ==========================================
// UTILITIES
// ==========================================

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );



const ActionCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
    {ACTION_CARDS.map((action) => {
      const Icon = action.icon;
      return (
        <div
          key={action.title}
          className="group bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div
            className={`h-11 w-11 rounded-xl ${action.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}
          >
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {action.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {action.description}
            </p>
          </div>
        </div>
      );
    })}
  </div>
);

const QuickStats = () => {
  const income = TRANSACTIONS.filter(
    (t) => !t.isDateGroupRow && t.isIncome,
  ).reduce((s, t) => s + t.amount, 0);
  const expense = TRANSACTIONS.filter(
    (t) => !t.isDateGroupRow && !t.isIncome,
  ).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-planner-green-light flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-planner-green" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            Total income
          </p>
          <p className="text-xl font-bold text-planner-green">
            {formatCurrency(income)}
          </p>
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-planner-pink-light flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-planner-pink" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            Total expense
          </p>
          <p className="text-xl font-bold text-planner-pink">
            {formatCurrency(expense)}
          </p>
        </div>
      </div>
    </div>
  );
};

const TransactionList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm) return TRANSACTIONS;
    const q = searchTerm.toLowerCase();
    return TRANSACTIONS.filter(
      (t) =>
        t.isDateGroupRow ||
        t.name.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-foreground">
              Transaction history
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.filter((t) => !t.isDateGroupRow).length} transactions
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 w-52"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-border">
        {filtered.map((txn) => {
          if (txn.isDateGroupRow) {
            return (
              <div key={txn.id} className="px-5 py-3 bg-muted/40">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {txn.name}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={txn.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              {/* Icon */}
              <div
                className={`shrink-0 h-9 w-9 rounded-lg ${txn.iconBg} flex items-center justify-center`}
              >
                <span className={`text-xs font-bold ${txn.iconColor}`}>
                  {txn.iconText}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground text-sm">
                  {txn.name}
                </span>
                {txn.category && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {txn.category}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {txn.date}
              </div>

              {/* Amount */}
              <span
                className={`font-bold text-sm shrink-0 w-28 text-right ${txn.isIncome ? "text-planner-green" : "text-foreground"}`}
              >
                {txn.isIncome ? "+" : "-"}
                {formatCurrency(txn.amount)}
              </span>

              {/* Actions */}
              <button className="p-1.5 hover:bg-muted rounded-lg transition-colors shrink-0">
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          );
        })}

        {filtered.filter((t) => !t.isDateGroupRow).length === 0 && (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">
              No transactions found
            </p>
            <p className="text-muted-foreground text-sm">
              Try changing your search keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN
// ==========================================

export default function Transaction() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ActionCards />
        <QuickStats />
        <TransactionList />
      </main>
    </div>
  );
}
