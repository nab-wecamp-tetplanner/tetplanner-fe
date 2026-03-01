import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Thêm import này
import {
  Loader2,
  Plus,
  Check,
  Folder,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import type { TetConfig } from "../../types/tetConfig.types"; 

interface ConfigSelectionProps {
  configs: TetConfig[];
  isLoading: boolean;
}

const ConfigSelector: React.FC<ConfigSelectionProps> = ({
  configs,
  isLoading,
}) => {
  const configId = useAppStore((state) => state.configId); 
  const setConfigId = useAppStore((state) => state.setConfigId);
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // 2. Khởi tạo navigate

  const [isCreating, setIsCreating] = useState(false);
  useEffect(() => {
    if (configId) {
      navigate("/dashboard"); 
    }
  }, [configId, navigate]);

  const [name, setName] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [totalBudget, setTotalBudget] = useState<number>(0);

  const createMutation = useMutation({
    mutationFn: (newConfigData: {
      name: string;
      year: number;
      total_budget: number;
    }) => {
      return apiClient.tetConfigs.create(newConfigData);
    },
    onSuccess: (newConfig) => {
      toast.success("Workspace created successfully!");

      // Update Zustand state with the newly created config ID
      if (newConfig && (newConfig as any).id) {
        setConfigId((newConfig as any).id);
        navigate("/"); // 3. Chuyển hướng về trang chủ sau khi tạo xong
      }

      // Invalidate the query to refresh the list in the background
      queryClient.invalidateQueries({ queryKey: ["userConfigs"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Failed to create workspace. Please try again.",
      );
    },
  });

  const handleSelect = (id: string) => {
    setConfigId(id);
    toast.success("Workspace selected successfully!");
    navigate("/"); // 4. Chuyển hướng về trang chủ sau khi chọn
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger the mutation
    createMutation.mutate({
      name: name,
      year: Number(year),
      total_budget: totalBudget === null ? 0 : Number(totalBudget),
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 shadow-sm">
        <h2 className="text-xl font-bold text-center mb-6">
          Welcome! Please set up your config
        </h2>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : configs.length > 0 && !isCreating ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              Select an existing config:
            </p>
            {configs.map((conf) => (
              <button
                key={(conf as any).id}
                onClick={() => handleSelect((conf as any).id)}
                className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div>
                  <span className="font-medium block">{conf.name}</span>
                  {conf.year && (
                    <span className="text-xs text-gray-500">
                      Year: {conf.year}
                    </span>
                  )}
                </div>
                <Check className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-400 rounded-xl hover:bg-muted transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Create new config
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              {configs.length === 0
                ? "You don't have any workspaces yet. Let's create one:"
                : "Create a new workspace:"}
            </p>

            {/* Name Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Config Name
              </label>
              <div className="relative">
                <Folder className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={createMutation.isPending}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm disabled:opacity-50"
                  placeholder="e.g., Financial Year 2026"
                />
              </div>
            </div>

            {/* Year Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Year
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  disabled={createMutation.isPending}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm disabled:opacity-50"
                  placeholder="e.g., 2026"
                />
              </div>
            </div>

            {/* Total Budget Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Total Budget
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={
                    totalBudget
                      ? new Intl.NumberFormat("vi-VN").format(totalBudget)
                      : ""
                  }
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const rawValue = inputValue.replace(/\D/g, "");
                    setTotalBudget(rawValue ? Number(rawValue) : 0);
                  }}
                  disabled={createMutation.isPending}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm disabled:opacity-50"
                  placeholder="e.g., 500.000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all mt-6 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Start"
              )}
            </button>

            {configs.length > 0 && !createMutation.isPending && (
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-full text-sm text-gray-500 hover:underline mt-2"
              >
                Back to list
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ConfigSelector;