import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ProgressSide = 'anime' | 'manga';

export type SidePointer = {
  position: number;
  updatedAt: number;
};

export type SeriesProgress = {
  anime?: SidePointer;
  manga?: SidePointer;
};

type State = {
  byRouteId: Record<number, SeriesProgress>;
  setSide: (routeId: number, side: ProgressSide, position: number) => void;
  clearSide: (routeId: number, side: ProgressSide) => void;
  clearSeries: (routeId: number) => void;
};

const withSide = (
  current: SeriesProgress | undefined,
  side: ProgressSide,
  pointer: SidePointer
): SeriesProgress => ({
  ...(current ?? {}),
  [side]: pointer,
});

const withoutSide = (
  current: SeriesProgress | undefined,
  side: ProgressSide
): SeriesProgress | null => {
  if (!current) return null;
  const next = { ...current };
  delete next[side];
  return next.anime || next.manga ? next : null;
};

export const useProgress = create<State>()(
  persist(
    (set) => ({
      byRouteId: {},
      setSide: (routeId, side, position) =>
        set((s) => ({
          byRouteId: {
            ...s.byRouteId,
            [routeId]: withSide(s.byRouteId[routeId], side, {
              position,
              updatedAt: Date.now(),
            }),
          },
        })),
      clearSide: (routeId, side) =>
        set((s) => {
          const next = withoutSide(s.byRouteId[routeId], side);
          const { [routeId]: _, ...rest } = s.byRouteId;
          return { byRouteId: next ? { ...rest, [routeId]: next } : rest };
        }),
      clearSeries: (routeId) =>
        set((s) => {
          const { [routeId]: _, ...rest } = s.byRouteId;
          return { byRouteId: rest };
        }),
    }),
    {
      name: 'kasane-progress',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ byRouteId: s.byRouteId }),
    }
  )
);

export const useSeriesProgress = (routeId: number): SeriesProgress | undefined =>
  useProgress((s) => s.byRouteId[routeId]);

export type InProgressEntry = {
  routeId: number;
  progress: SeriesProgress;
  updatedAt: number;
};

export const useInProgressEntries = (): InProgressEntry[] => {
  const byRouteId = useProgress((s) => s.byRouteId);
  return useMemo(
    () =>
      Object.entries(byRouteId)
        .map(([id, progress]) => ({
          routeId: Number(id),
          progress,
          updatedAt: Math.max(
            progress.anime?.updatedAt ?? 0,
            progress.manga?.updatedAt ?? 0
          ),
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [byRouteId]
  );
};
