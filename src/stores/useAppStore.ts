import { create } from 'zustand';

interface AppState {
  configId: string | null;
  setConfigId: (id: string) => void;
  clearConfig: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  configId: null,

  setConfigId: (newId) => set({ configId: newId }),
  clearConfig: () => set({ configId: null}),
}));