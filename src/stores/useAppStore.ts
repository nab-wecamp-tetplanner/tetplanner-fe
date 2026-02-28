import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  configId: string | null;
  setConfigId: (id: string) => void;
  clearConfig: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      configId: null,

      setConfigId: (newId) => set({ configId: newId }),
      clearConfig: () => set({ configId: null }),

      refreshKey: 0,
      triggerRefresh: () =>
        set((state) => ({ refreshKey: state.refreshKey + 1 })),
    }),
    {
      name: "tetConfigId", // localStorage key
      partialize: (state) => ({ configId: state.configId }), // only persist configId
    },
  ),
);
