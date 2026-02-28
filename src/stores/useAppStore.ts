import { create } from "zustand";
<<<<<<< HEAD
import { persist } from "zustand/middleware";
=======
>>>>>>> origin/main

interface AppState {
  configId: string | null;
  setConfigId: (id: string) => void;
  clearConfig: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

<<<<<<< HEAD
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
=======
// Xóa bỏ middleware persist
export const useAppStore = create<AppState>((set) => ({
  configId: null,
  setConfigId: (newId) => set({ configId: newId }),
  clearConfig: () => set({ configId: null }),
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  resetAll: () => set({ configId: null, refreshKey: 0 }),
}));
>>>>>>> origin/main
