import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type State = {
  japanese: boolean;
  toggleJapanese: () => void;

  hiddenGenres: string[];
  toggleHiddenGenre: (id: string) => void;
};

export const usePreferences = create<State>()(
  persist(
    (set) => ({
      japanese: false,
      toggleJapanese: () => set((s) => ({ japanese: !s.japanese })),

      hiddenGenres: ['ecchi'],
      toggleHiddenGenre: (id) =>
        set((s) => ({
          hiddenGenres: s.hiddenGenres.includes(id)
            ? s.hiddenGenres.filter((x) => x !== id)
            : [...s.hiddenGenres, id],
        })),
    }),
    {
      name: 'kasane-preferences',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        japanese: s.japanese,
        hiddenGenres: s.hiddenGenres,
      }),
    }
  )
);
