import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Minus,
  ArrowLeftRight,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  Package,
  ShoppingCart,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { transactionApi } from "../services/transactionService";
import { financeApi } from "../services/financeApi";
// import type { TransactionResponse } from "../services/transactionService";
import { AddTransactionModal } from "../components/Transaction/AddTransactionModal"; // Import Modal thêm/sửa
import { useAppStore } from "../stores/useAppStore";
import type { Category } from "../types/dashboard.types";
import type { Transaction as TransactionBase } from "../types/transaction.types";
import type { TransactionResponse } from "../services/transactionService";
import FallingPetals from "../components/FallingPetals/FallingPetals";
import {
  Lantern,
  BlossomBranch,
  CloudMotif,
  TraditionalCake,
} from "../components/Decoratives/Decoratives";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles: Sparkles,
  Package: Package,
  ShoppingCart: ShoppingCart,
  Gift: Gift,
};

// ==========================================
// TYPES & CONSTANTS
// ==========================================
export interface TransactionFormData {
  amount: number;
  type: "income" | "expense";
  note: string;
  category_id?: string; // Dấu ? tương đương với string | undefined
  transaction_date: string;
}

export interface TransactionType {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  iconText?: string;
  date?: string;
  amount: number;
  isIncome: boolean;
}

const ACTION_CARDS = [
  {
    title: "Add income",
    description: "Create an income manually",
    icon: Plus,
    type: "income",
    tokenBg: "bg-planner-green-light",
    iconBg: "bg-planner-green",
  },
  {
    title: "Add expense",
    description: "Create an expense manually",
    icon: Minus,
    type: "expense",
    tokenBg: "bg-planner-pink-light",
    iconBg: "bg-planner-pink",
  },
  {
    title: "Transfer money",
    description: "Select the amount and make a transfer",
    icon: ArrowLeftRight,
    type: "transfer",
    tokenBg: "bg-planner-blue-light",
    iconBg: "bg-planner-blue",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const BACKGROUND_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d6cfc4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

// ==========================================
// SUB-COMPONENTS
// ==========================================

const QuickStats = ({ transactions }: { transactions: TransactionType[] }) => {
  const income = transactions
    .filter((t) => t.isIncome)
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter((t) => !t.isIncome)
    .reduce((s, t) => s + t.amount, 0);

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

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function Transaction() {
  const tetConfigId = useAppStore((state) => state.configId);
  const setConfigId = useAppStore((state) => state.setConfigId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionType | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<
    "income" | "expense"
  >("expense");

  // Hàm tải danh sách giao dịch (để gọi lại sau khi thêm/sửa/xóa)
  // Cập nhật hàm fetchTxns bên trong component Transaction
  const fetchTxns = async (configId: string | null, silent = false) => {
    if (!configId) return;
    if (!silent) setLoading(true);

    try {
      const data = await transactionApi.getAll(configId);
      const mapped = (data || []).map((val: TransactionResponse) => {
        const t = val as unknown as TransactionBase;

        // FIX LỖI [object Object]: Kiểm tra nếu t.category là object thì lấy .id
        const rawCategory = t.category || (t as any).category_id;
        let finalId = "";

        if (typeof rawCategory === "object" && rawCategory !== null) {
          finalId = (rawCategory as any).id;
        } else {
          finalId = String(rawCategory || "");
        }

        return {
          id: t.id,
          name: (t.note || "Transaction").replace("Completed: ", ""),
          categoryId: finalId.trim(),
          date: t.transaction_date?.slice(0, 10),
          amount: Number(t.amount),
          isIncome: t.type === "income",
        };
      });

      setTransactions(mapped);
    } catch (err) {
      console.error("Lỗi fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const configsData = await financeApi.getTetConfigs();
        if (configsData.length > 0) {
          const currentId = tetConfigId || configsData[0].id;
          if (!tetConfigId) setConfigId(currentId);
          const catsData = await financeApi.getCategories(currentId);
          setCategories(catsData as Category[]);
          fetchTxns(currentId);
        }
      } catch (err) {
        console.error("Lỗi khởi tạo:", err);
      }
    };
    initData();
  }, [tetConfigId, setConfigId]);

  const handleOpenAddModal = (type: "income" | "expense") => {
    setEditingTransaction(null);
    setModalDefaultType(type);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (txn: TransactionType) => {
    setEditingTransaction(txn);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    try {
      await transactionApi.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  const handleSaveTransaction = async (formData: TransactionFormData) => {
    if (!tetConfigId) return;

    try {
      // Dữ liệu sạch (chuyển rỗng thành undefined để Backend không than phiền)
      const cleanData = {
        ...formData,
        category_id: formData.category_id || undefined,
      };

      if (editingTransaction) {
        // UPDATE (PATCH): Tuyệt đối KHÔNG gửi tet_config_id lên
        await transactionApi.update(editingTransaction.id, cleanData);
      } else {
        // CREATE (POST): Bắt buộc PHẢI có tet_config_id
        await transactionApi.create({
          ...cleanData,
          tet_config_id: tetConfigId,
        });
      }
      await fetchTxns(tetConfigId, true);
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
    }
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const cat = categories.find(
        (c) => String(c.id).trim() === String(t.categoryId).trim(),
      );
      const searchStr = searchTerm.toLowerCase();
      return (
        t.name.toLowerCase().includes(searchStr) ||
        (cat?.name && cat.name.toLowerCase().includes(searchStr))
      );
    });
  }, [searchTerm, transactions, categories]);
  return (
    <div className="relative min-h-screen bg-(--bg) text-(--text) transition-colors duration-500 overflow-hidden font-sans">
      <div
        className="absolute inset-0 pointer-events-none z-0 tet-deco-element transition-opacity duration-500"
        style={{
          backgroundImage: BACKGROUND_PATTERN,
          opacity: "var(--pattern-opacity)",
        }}
      ></div>
      <div
        className="absolute inset-0 pointer-events-none z-0 tet-deco-element transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 20% 0%, var(--gradient-bg-1) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, var(--gradient-bg-2) 0%, transparent 50%)`,
        }}
      ></div>

      {/* 2. Decorative Elements lơ lửng phía sau */}
      <div className="tet-deco-element">
        <FallingPetals count={15} />
      </div>
      <Lantern
        className="absolute top-8 right-[15%] animate-[swing_4s_ease-in-out_infinite] z-0 opacity-80 tet-deco-element"
        size="md"
      />
      <BlossomBranch
        className="absolute top-20 -left-8 animate-[float_6s_ease-in-out_infinite] z-0 opacity-80 tet-deco-element transform scale-90"
        variant="apricot"
      />
      <CloudMotif className="absolute top-32 left-[20%] animate-[float_7s_ease-in-out_infinite] z-0 opacity-50 tet-deco-element" />
      <TraditionalCake
        className="absolute bottom-20 right-8 z-0 opacity-30 animate-[float_4s_ease-in-out_infinite] tet-deco-element"
        variant="tet"
      />
      <div className="min-h-screen bg-transparent">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-8 gap-4">
            <div>
              <p className="text-sm font-bold text-(--primary) mb-1 tracking-wide uppercase">
                Transactions
              </p>
              <h1 className="text-4xl font-serif text-foreground">
                Transactions
              </h1>
            </div>
            <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border text-sm font-medium text-muted-foreground shadow-sm">
              <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold">
                This month
              </button>
              <button className="px-3 py-1.5 hover:bg-muted rounded-lg text-xs">
                Year
              </button>
            </div>
          </div>

          {/* Action Cards - Giữ nguyên bg-card (màu trắng) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {ACTION_CARDS.map((action) => (
              <div
                key={action.title}
                onClick={() => {
                  if (action.type !== "transfer") {
                    handleOpenAddModal(action.type as "income" | "expense");
                  }
                }}
                className="group bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md cursor-pointer transition-all"
              >
                <div
                  className={`h-11 w-11 rounded-xl ${action.iconBg} flex items-center justify-center text-white shadow-sm`}
                >
                  <action.icon className="w-5 h-5" />
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
            ))}
          </div>

          <QuickStats transactions={transactions} />

          {/* TRANSACTION HISTORY LIST - Giữ nguyên bg-card (màu trắng) */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-foreground">
                  Transaction history
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filtered.length} items
                </p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 w-52 text-foreground"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="divide-y divide-border">
              {loading ? (
                <div className="py-20 text-center text-muted-foreground animate-pulse font-medium">
                  Loading history...
                </div>
              ) : (
                filtered.map((txn) => {
                  // TRA CỨU CATEGORY (Fix lỗi [object Object] bằng cách trim() ID)
                  const catData = categories.find(
                    (c) =>
                      String(c.id).trim() === String(txn.categoryId).trim(),
                  );

                  const categoryColor = catData?.color || "#94a3b8";
                  const displayCategoryName = catData?.name || "Uncategorized";
                  const displayIconName = catData?.icon || "Package";

                  // FIX LỖI CRASH: Định nghĩa IconComponent NGAY TẠI ĐÂY!
                  const IconComponent =
                    ICON_MAP[displayIconName as string] || Package;

                  return (
                    <div
                      key={txn.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                    >
                      <div
                        className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${txn.isIncome ? "bg-planner-green border-planner-green shadow-sm" : "border-border"}`}
                      >
                        {txn.isIncome && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>

                      <div
                        className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${categoryColor}20` }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: categoryColor }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {txn.name}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${categoryColor}20`,
                              color: categoryColor,
                            }}
                          >
                            {displayCategoryName}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {txn.date}
                      </div>

                      <div className="hidden md:block shrink-0">
                        {txn.isIncome ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg uppercase shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Income
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-planner-amber bg-planner-amber-light px-2 py-1 rounded-lg uppercase shadow-sm">
                            <Clock className="w-3 h-3" /> Expense
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-bold text-sm shrink-0 w-28 text-right ${txn.isIncome ? "text-planner-green" : "text-foreground"}`}
                      >
                        {txn.isIncome ? "+" : "-"} {formatCurrency(txn.amount)}
                      </span>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(txn)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(txn.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>

        <AddTransactionModal
          key={editingTransaction?.id || (isModalOpen ? "new" : "closed")}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTransaction}
          categories={categories}
          initialData={editingTransaction}
          defaultType={modalDefaultType}
        />
      </div>
    </div>
  );
}
