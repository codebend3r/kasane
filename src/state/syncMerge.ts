import type { PreferencesData } from "@/state/preferences";
import type { ProgressByRoute } from "@/state/progress";
import type { ProgressSide } from "@/types";

// Pure reconciliation helpers for the cloud-sync controller. Kept free of
// react-native / supabase imports so they can be unit tested in isolation.
// Remote rows are converted to these shapes at the Supabase boundary in
// `sync.ts`, so nothing here deals in column names or ISO strings.

/** One side of one series' progress, the unit `user_progress` stores. */
export type ProgressEntry = {
  routeId: number;
  side: ProgressSide;
  position: number;
  updatedAt: number;
};

const SIDES: readonly ProgressSide[] = ["anime", "manga"];

const keyOf = (e: Pick<ProgressEntry, "routeId" | "side">): string =>
  `${e.routeId}:${e.side}`;

const byKey = (entries: readonly ProgressEntry[]): Map<string, ProgressEntry> =>
  new Map(entries.map((e) => [keyOf(e), e]));

export const flattenProgress = (byRoute: ProgressByRoute): ProgressEntry[] =>
  Object.entries(byRoute).flatMap(([routeId, progress]) =>
    SIDES.flatMap((side) => {
      const pointer = progress[side];
      return pointer
        ? [
            {
              routeId: Number(routeId),
              side,
              position: pointer.position,
              updatedAt: pointer.updatedAt,
            },
          ]
        : [];
    }),
  );

export const rebuildProgress = (
  entries: readonly ProgressEntry[],
): ProgressByRoute =>
  entries.reduce<ProgressByRoute>(
    (acc, e) => ({
      ...acc,
      [e.routeId]: {
        ...acc[e.routeId],
        [e.side]: { position: e.position, updatedAt: e.updatedAt },
      },
    }),
    {},
  );

/**
 * Merges local progress with the server's entries, last-write-wins per
 * (routeId, side). Union of both sides; ties keep the local value.
 */
export const mergeProgress = (
  local: ProgressByRoute,
  remote: readonly ProgressEntry[],
): ProgressByRoute => {
  const localEntries = flattenProgress(local);
  const localByKey = byKey(localEntries);
  const remoteByKey = byKey(remote);
  const localKept = localEntries.filter(
    (l) => (remoteByKey.get(keyOf(l))?.updatedAt ?? -1) <= l.updatedAt,
  );
  const remoteWins = remote.filter(
    (r) => (localByKey.get(keyOf(r))?.updatedAt ?? -1) < r.updatedAt,
  );
  return rebuildProgress([...localKept, ...remoteWins]);
};

export type ProgressSideDelete = { routeId: number; side: ProgressSide };

export type ProgressDelta = {
  upserts: ProgressEntry[];
  deletes: ProgressSideDelete[];
};

/** Rows to upsert/delete to move the server from `prev` to `next`. */
export const diffProgress = (
  prev: ProgressByRoute,
  next: ProgressByRoute,
): ProgressDelta => {
  const prevByKey = byKey(flattenProgress(prev));
  const nextEntries = flattenProgress(next);
  const nextByKey = byKey(nextEntries);

  const upserts = nextEntries.filter((n) => {
    const p = prevByKey.get(keyOf(n));
    return !p || p.position !== n.position || p.updatedAt !== n.updatedAt;
  });
  const deletes = [...prevByKey.values()]
    .filter((p) => !nextByKey.has(keyOf(p)))
    .map((p) => ({ routeId: p.routeId, side: p.side }));

  return { upserts, deletes };
};

/**
 * Last-write-wins for the single preferences row. `remote` is null when the
 * user has no row yet, in which case the local copy stands.
 */
export const mergePreferences = (
  local: PreferencesData,
  remote: PreferencesData | null,
): PreferencesData =>
  remote && remote.updatedAt > local.updatedAt ? remote : local;
