/* ConfigSelector.tsx */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Plus,
  Check,
  Folder,
  Calendar,
  DollarSign,
  X,
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import confetti from "canvas-confetti";

const ConfigSelector: React.FC = () => {
  const { configId, setConfigId } = useAppStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1. Giữ nguyên state isCreating để người dùng chủ động bấm nút "Create New"
  const [isCreating, setIsCreating] = useState(false);

  const [name, setName] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [totalBudget, setTotalBudget] = useState<number>(0);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["userConfigs"],
    queryFn: () => apiClient.tetConfigs.getMyConfigs(),
  });

  // 2. TÍNH TOÁN DỰA TRÊN DỮ LIỆU (Derived State)
  // Nếu list trống và load xong rồi thì TỰ ĐỘNG coi như đang ở mode Creating
  const effectivelyCreating =
    isCreating || (!isLoading && configs.length === 0);

  // 3. EFFECT ĐIỀU HƯỚNG: Chỉ chạy khi đã có config và KHÔNG trong mode tạo mới
  useEffect(() => {
    if (configId && !effectivelyCreating) {
      navigate("/");
    }
  }, [configId, navigate, effectivelyCreating]);

  const createMutation = useMutation({
    mutationFn: (newConfigData: {
      name: string;
      year: number;
      total_budget: number;
    }) => {
      return apiClient.tetConfigs.create(newConfigData);
    },
    onSuccess: (newConfig) => {
      // 1. BẮN PHÁO HOA
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 10000,
      };
      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#ff0000", "#ffd700"],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#ff0000", "#ffd700"],
        });
      }, 250);

      toast.success("Workspace created! Happy Planning! 🧧");
      if (newConfig && (newConfig as any).id) {
        setTimeout(() => {
          setConfigId((newConfig as any).id);
          setIsCreating(false);
        }, 1500);
      }
      queryClient.invalidateQueries({ queryKey: ["userConfigs"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create workspace.");
    },
  });

  const handleSelect = (id: string) => {
    setConfigId(id);
    toast.success("Workspace selected!");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.warn("Please enter a workspace name");
    createMutation.mutate({ name, year, total_budget: totalBudget });
  };

  return (
    // LỚP NỀN: Dùng đen rất nhạt + Blur cực mạnh để làm nổi bật theme bên dưới mà không bị "gớm"
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/10 backdrop-blur-xl animate-in fade-in duration-500 p-4">
      {/* KHUNG MODAL: Dùng màu nền theme, bo góc siêu lớn, có viền accent */}
      <div className="max-w-md w-full bg-(--bg) border border-(--primary)/20 rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Điểm nhấn màu sắc ở góc */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-(--primary)/5 blur-3xl rounded-full"></div>
        <button
          onClick={() => {
            if (isCreating && configs.length > 0) {
              // Nếu đang lỡ bấm vào "Create New" mà muốn quay lại list
              setIsCreating(false);
            } else if (configId || configs.length > 0) {
              // Nếu đã có plan hoặc danh sách không trống thì cho về Home
              navigate("/");
            } else {
              // Chỉ hiện toast khi thực sự không có plan nào để chạy App
              toast.warn("Please select a workspace to start planning!");
            }
          }}
          className="absolute top-6 right-6 p-2 rounded-full text-(--text) opacity-30 hover:opacity-100 hover:bg-accent/20 transition-all z-20"
        >
          <X size={20} strokeWidth={3} />
        </button>
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-(--text) tracking-tight uppercase">
              {isCreating ? "New Workspace" : "Select Workspace"}
            </h2>
            <p className="text-sm text-(--text) opacity-50 mt-1 font-medium italic">
              {isCreating
                ? "Set up your planning environment"
                : "Choose a workspace to continue"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-(--primary)" />
              <span className="text-[10px] font-black text-(--text) opacity-40 uppercase tracking-widest">
                Fetching Data...
              </span>
            </div>
          ) : configs.length > 0 && !isCreating ? (
            <div className="space-y-3">
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {configs.map((conf: any) => (
                  <button
                    key={conf.id}
                    onClick={() => handleSelect(conf.id)}
                    className="w-full group flex items-center justify-between p-5 border border-(--primary)/20 rounded-[1.5rem] hover:border-(--primary) hover:bg-(--primary)/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-(--bg) transition-colors">
                        <Calendar className="w-5 h-5 text-(--text) opacity-40 group-hover:text-(--primary) group-hover:opacity-100" />
                      </div>
                      <div>
                        <span className="font-bold text-(--text) block">
                          {conf.name}
                        </span>
                        <span className="text-[10px] font-black text-(--text) opacity-40 uppercase">
                          Year: {conf.year}
                        </span>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-(--primary) opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-4 border-2 border-dashed border-(--primary)/30 rounded-[1.5rem] text-(--text) opacity-40 font-bold mt-4 flex items-center justify-center gap-2 hover:border-(--primary) hover:text-(--primary) hover:opacity-100 transition-all"
              >
                <Plus size={18} /> Create New Workspace
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-5">
              {/* Input Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-(--text) opacity-40 uppercase ml-2 tracking-wider">
                  Workspace Name
                </label>
                <div className="relative group">
                  <Folder className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-30 group-focus-within:text-(--primary) group-focus-within:opacity-100 transition-all" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-accent/10 border-none rounded-2xl focus:ring-2 focus:ring-(--primary)/20 outline-none text-sm font-bold text-(--text) placeholder:text-(--text)/20 transition-all"
                    placeholder="e.g., Financial Year 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-(--text) opacity-40 uppercase ml-2 tracking-wider">
                    Year
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-30 group-focus-within:text-(--primary) transition-all" />
                    <input
                      type="number"
                      required
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-4 bg-accent/10 border-none rounded-2xl focus:ring-2 focus:ring-(--primary)/20 outline-none text-sm font-bold text-(--text) transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-(--text) opacity-40 uppercase ml-2 tracking-wider">
                    Budget
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-30 group-focus-within:text-(--primary) transition-all" />
                    <input
                      type="text"
                      required
                      value={
                        totalBudget
                          ? new Intl.NumberFormat("vi-VN").format(totalBudget)
                          : ""
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setTotalBudget(raw ? Number(raw) : 0);
                      }}
                      className="w-full pl-11 pr-4 py-4 bg-accent/10 border-none rounded-2xl focus:ring-2 focus:ring-(--primary)/20 outline-none text-sm font-bold text-(--text) transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-(--primary) hover:opacity-90 text-white font-black py-4 rounded-[1.5rem] transition-all shadow-lg shadow-(--primary)/20 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Create & Start Planning"
                  )}
                </button>

                {configs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="w-full text-xs font-black text-(--text) opacity-30 hover:opacity-100 uppercase tracking-widest transition-all"
                  >
                    ← Back to list
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigSelector;
