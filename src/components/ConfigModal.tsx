import React, { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { Loader2 } from "lucide-react";

// Định nghĩa interface linh hoạt hơn để dùng chung được cho cả ConfigInfo và FullConfigData
export interface EditConfigData {
  id?: string;
  name?: string;
  year?: number;
  total_budget?: number;
}

interface AddConfigModalProps {
  isOpen: boolean;
  isEdit?: boolean;
  editConfig?: EditConfigData | null;
  setIsOpen: Dispatch<SetStateAction<boolean>> | ((isOpen: boolean) => void);
  onSubmit: (data: { name: string; year: number; total_budget: number }) => void;
  isLoading?: boolean; // Thêm loading state
}

export const ConfigModal: React.FC<AddConfigModalProps> = ({
  isOpen,
  isEdit = false,
  editConfig,
  setIsOpen,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [budget, setBudget] = useState<number>(0);

  // Điền dữ liệu nếu là chế độ Edit, hoặc reset nếu là Add New
  useEffect(() => {
    if (isOpen) {
      if (isEdit && editConfig) {
        setName(editConfig.name || "");
        setYear(editConfig.year || new Date().getFullYear());
        setBudget(editConfig.total_budget || 0);
      } else {
        setName("");
        setYear(new Date().getFullYear());
        setBudget(0);
      }
    }
  }, [isOpen, isEdit, editConfig]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !budget) {
      alert("Please fill in all required fields!");
      return;
    }
    onSubmit({
      name: name.trim(),
      year: Number(year),
      total_budget: Number(budget),
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-(--bg-card)  border border-(--border)  p-6 shadow-2xl transition-colors">
        <h2 className="mb-4 text-xl font-bold text-(--text-heading) ">
          {isEdit ? "Edit Workspace" : "Add New Workspace"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên cấu hình */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-(--text-muted) ">
              Name (Ex: TẾT 2026)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-(--border)  bg-(--bg)  px-4 py-2.5 text-(--text)  focus:border-(--primary)  focus:outline-none focus:ring-2 focus:ring-(--primary) /20 transition-all"
              placeholder="Config name..."
              required
            />
          </div>

          {/* Năm */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-(--text-muted) ">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={isLoading}
              className="w-full rounded-xl border border-(--border)  bg-(--bg)  px-4 py-2.5 text-(--text)  focus:border-(--primary)  focus:outline-none focus:ring-2 focus:ring-(--primary) /20 transition-all"
              required
            />
          </div>

          {/* Tổng ngân sách - Có format tiền tệ */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-(--text-muted) ">
              Total budget (VND)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={budget ? new Intl.NumberFormat("vi-VN").format(budget) : ""}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                setBudget(rawValue ? Number(rawValue) : 0);
              }}
              disabled={isLoading}
              className="w-full rounded-xl border border-(--border)  bg-(--bg)  px-4 py-2.5 text-(--text-heading)  font-semibold focus:border-(--primary)  focus:outline-none focus:ring-2 focus:ring-(--primary) /20 transition-all"
              placeholder="Ex: 5.000.000"
              required
            />
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-(--text-muted)  hover:bg-(--bg)  transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-(--primary)  px-6 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};