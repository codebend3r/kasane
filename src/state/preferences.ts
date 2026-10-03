import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** The part of the store that is persisted and synced to the account. */
export type PreferencesData = {
  japanese: boolean;
  hiddenGenres: string[];
  // Last local edit, in epoch ms. Drives last-write-wins against the cloud copy.
  updatedAt: number;
};

/** Just the data fields, so persistence and sync never write the actions. */
export const pickPreferences = ({
  japanese,
  hiddenGenres,
  updatedAt,
}: PreferencesData): PreferencesData => ({ japanese, hiddenGenres, updatedAt });

type State = PreferencesData & {
  toggleJapanese: () => void;
  toggleHiddenGenre: (id: string) => void;
  // Replaces the whole selection in one write, so "show/hide all" is a single
  // state change rather than one per chip.
  setHiddenGenres: (ids: string[]) => void;
};

export const usePreferences = create<State>()(
  persist(
    (set) => ({
      japanese: false,
      toggleJapanese: () =>
        set((s) => ({ japanese: !s.japanese, updatedAt: Date.now() })),

      hiddenGenres: [],
      toggleHiddenGenre: (id) =>
        set((s) => ({
          hiddenGenres: s.hiddenGenres.includes(id)
            ? s.hiddenGenres.filter((x) => x !== id)
            : [...s.hiddenGenres, id],
          updatedAt: Date.now(),
        })),

      setHiddenGenres: (ids) =>
        set({ hiddenGenres: [...ids], updatedAt: Date.now() }),

      updatedAt: 0,
    }),
    {
      name: "kasane-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => pickPreferences(s),
    },
  ),
);
