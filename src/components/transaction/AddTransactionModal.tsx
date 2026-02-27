import React, { useState, useEffect } from "react";
import {
  X,
  Banknote,
  FileText,
  Tag,
  Calendar,
  ChevronDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Sparkles,
} from "lucide-react";
import type { TransactionType } from "../../pages/Transaction";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  categories: any[];
  initialData?: TransactionType | null;
  defaultType?: "income" | "expense";
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
  defaultType = "expense",
}) => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setType(initialData.isIncome ? "income" : "expense");
        setNote(initialData.name);
        setCategoryId(initialData.categoryId || "");
        setDate(initialData.date || new Date().toISOString().split("T")[0]);
      } else {
        setAmount("");
        setType(defaultType);
        setNote("");
        setCategoryId(categories.length > 0 ? categories[0].id : "");
        setDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [isOpen, initialData, defaultType, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !note) return;

    onSave({
      amount: parseFloat(amount),
      type,
      note,
      category_id: categoryId || null,
      transaction_date: new Date(date).toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl max-w-[400px] w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl text-foreground capitalize">
              {initialData ? "Edit Transaction" : `Add ${type}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* --- COMBINED FRAME TOGGLE (Segmented Control) --- */}
          <div className="flex p-1.5 bg-muted/50 rounded-2xl border border-border/50">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                type === "expense"
                  ? "bg-white shadow-sm text-destructive"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownCircle
                className={`w-4 h-4 ${type === "expense" ? "text-destructive" : "text-muted-foreground/60"}`}
              />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                type === "income"
                  ? "bg-white shadow-sm text-planner-green"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpCircle
                className={`w-4 h-4 ${type === "income" ? "text-planner-green" : "text-muted-foreground/60"}`}
              />
              Income
            </button>
          </div>

          <div className="space-y-4">
            {/* Amount Field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Banknote className="w-4 h-4 text-planner-green" /> Amount (VND)
                *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
                min="0"
              />
            </div>

            {/* Note Field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <FileText className="w-4 h-4 text-planner-blue" /> Note *
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Monthly salary..."
                className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category selector with Chevron */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Tag className="w-4 h-4 text-planner-purple" /> Category
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none pr-10 cursor-pointer"
                  >
                    <option value="">None</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Calendar className="w-4 h-4 text-planner-pink" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-2xl bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-border text-foreground rounded-2xl hover:bg-muted transition-all font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-all font-bold text-sm shadow-lg shadow-primary/20"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
