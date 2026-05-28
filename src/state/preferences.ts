import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AniListMedia } from '@/types';

export type Language = 'EN' | 'ROMAJI' | 'NATIVE';

type PreferencesState = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const webStorage = {
  getItem: (name: string) =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(name);
  },
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'EN',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'kasane-prefs',
      storage: createJSONStorage(() => webStorage),
    }
  )
);

export function pickTitle(
  media: Pick<AniListMedia, 'title'>,
  language: Language
): string {
  const { english, romaji, native } = media.title;
  if (language === 'NATIVE') return native ?? english ?? romaji;
  if (language === 'ROMAJI') return romaji ?? english ?? native ?? '';
  return english ?? romaji ?? native ?? '';
}
