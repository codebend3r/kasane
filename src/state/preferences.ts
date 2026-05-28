import { create } from 'zustand';

type State = {
  japanese: boolean;
  toggleJapanese: () => void;
};

export const usePreferences = create<State>((set) => ({
  japanese: false,
  toggleJapanese: () => set((s) => ({ japanese: !s.japanese })),
}));
