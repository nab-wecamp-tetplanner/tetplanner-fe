import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-xl text-foreground">
            {initialData
              ? "Sửa giao dịch"
              : type === "income"
                ? "Thêm thu nhập"
                : "Thêm chi phí"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Số tiền (VND) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú *</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Vd: Mua bánh chưng, Lương thưởng..."
              className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Không có</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Ngày giao dịch
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl hover:bg-muted font-medium text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 font-medium text-sm shadow-sm"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
