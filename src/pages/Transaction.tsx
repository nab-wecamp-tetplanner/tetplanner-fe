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
import type { TransactionResponse } from "../services/transactionService";
import { AddTransactionModal } from "../components/transaction/AddTransactionModal"; // Import Modal thêm/sửa

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles: Sparkles,
  Package: Package,
  ShoppingCart: ShoppingCart,
  Gift: Gift,
};

// ==========================================
// TYPES & CONSTANTS
// ==========================================

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
    type: "income", // Thêm type để nhận diện
    tokenBg: "bg-planner-green-light",
    iconBg: "bg-planner-green",
  },
  {
    title: "Add expense",
    description: "Create an expense manually",
    icon: Minus,
    type: "expense", // Thêm type để nhận diện
    tokenBg: "bg-planner-pink-light",
    iconBg: "bg-planner-pink",
  },
  {
    title: "Transfer money",
    description: "Select the amount and make a transfer",
    icon: ArrowLeftRight,
    type: "transfer", // Thêm type để nhận diện
    tokenBg: "bg-planner-blue-light",
    iconBg: "bg-planner-blue",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

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
  const [tetConfigId, setTetConfigId] = useState<string>(
    localStorage.getItem("tetConfigId") || "",
  );
  const [allConfigs, setAllConfigs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionType | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<
    "income" | "expense"
  >("expense");

  // Hàm tải danh sách giao dịch (để gọi lại sau khi thêm/sửa/xóa)
  // Cập nhật hàm fetchTxns bên trong component Transaction
  const fetchTxns = async (configId: string, silent = false) => {
    if (!configId) return;

    // Chỉ hiện loading nếu không phải là refresh ngầm
    if (!silent) setLoading(true);

    try {
      const data = await transactionApi.getAll(configId);
      const mapped = (data || []).map((t: TransactionResponse) => ({
        id: t.id,
        name: t.note || t.category?.name || "Transaction",
        categoryId: t.category?.id || (t as any).category_id,
        categoryName: t.category?.name,
        date: t.transaction_date?.slice(0, 10),
        amount: Number(t.amount),
        isIncome: t.type === "income",
        iconText: t.category?.icon || "Package",
      }));
      setTransactions(mapped);
    } catch (err) {
      console.error("Lỗi fetch transactions:", err);
    } finally {
      // Luôn tắt loading ở cuối
      setLoading(false);
    }
  };

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    const initData = async () => {
      try {
        const configsData = await financeApi.getTetConfigs();
        setAllConfigs(configsData);

        if (configsData.length > 0) {
          const currentId = tetConfigId || configsData[0].id;
          setTetConfigId(currentId);
          localStorage.setItem("tetConfigId", currentId);

          const catsData = await financeApi.getCategories(currentId);
          setCategories(catsData);

          // Tải giao dịch
          fetchTxns(currentId);
        }
      } catch (err) {
        console.error("Lỗi khởi tạo dữ liệu:", err);
      }
    };
    initData();
  }, [tetConfigId]);

  // API HANDLERS
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

  const handleSaveTransaction = async (formData: any) => {
    try {
      if (editingTransaction) {
        await transactionApi.update(editingTransaction.id, formData);
      } else {
        await transactionApi.create({
          ...formData,
          tet_config_id: tetConfigId,
        });
      }

      // GỌI REFRESH NGẦM Ở ĐÂY (silent = true)
      // Người dùng vẫn thấy danh sách cũ, sau đó dữ liệu mới sẽ tự ghi đè lên mà không bị nháy Loading
      await fetchTxns(tetConfigId, true);

      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
    }
  };

  const filtered = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, transactions]);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-8 gap-4">
          <div>
            <p className="text-sm font-medium text-primary mb-1 tracking-wide uppercase">
              Transactions
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-serif text-foreground">
                Transactions
              </h1>
              <select
                value={tetConfigId}
                onChange={(e) => setTetConfigId(e.target.value)}
                className="ml-4 p-2 bg-card border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {allConfigs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name} ({config.year})
                  </option>
                ))}
              </select>
            </div>
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

        {/* Action Cards */}
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

        {/* TRANSACTION HISTORY LIST */}
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
                className="pl-9 pr-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 w-52"
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
                const catData = categories.find((c) => c.id === txn.categoryId);
                const categoryColor = catData?.color || "#94a3b8";
                const IconComponent =
                  ICON_MAP[txn.iconText as string] || Package;

                return (
                  <div
                    key={txn.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                  >
                    {/* Status Indicator */}
                    <div
                      className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${txn.isIncome ? "bg-planner-green border-planner-green shadow-sm" : "border-border"}`}
                    >
                      {txn.isIncome && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>

                    {/* Category Icon */}
                    <div
                      className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${categoryColor}20` }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: categoryColor }}
                      />
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">
                          {txn.name.replace("Completed: ", "")}
                        </span>
                        {txn.categoryName && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${categoryColor}20`,
                              color: categoryColor,
                            }}
                          >
                            {txn.categoryName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {txn.date}
                    </div>

                    {/* Status Badge */}
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

                    {/* Amount */}
                    <span
                      className={`font-bold text-sm shrink-0 w-28 text-right ${txn.isIncome ? "text-planner-green" : "text-foreground"}`}
                    >
                      {txn.isIncome ? "+" : "-"} {formatCurrency(txn.amount)}
                    </span>

                    {/* Actions */}
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

      {/* Modal Thêm/Sửa giao dịch */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        initialData={editingTransaction}
        defaultType={modalDefaultType}
      />
    </div>
  );
}
