import type { ProgressSide, SeriesProgress } from "@/state/progress";

// Pure reconciliation helpers shared by the cloud-sync controller. Kept free of
// react-native / supabase imports so they can be unit tested in isolation.

export type ProgressByRoute = Record<number, SeriesProgress>;

export type ProgressEntry = {
  routeId: number;
  side: ProgressSide;
  position: number;
  updatedAt: number;
};

// Shape of a `user_progress` row as returned by PostgREST.
export type RemoteProgressRow = {
  route_id: number;
  side: ProgressSide;
  position: number;
  updated_at: string;
};

const SIDES: readonly ProgressSide[] = ["anime", "manga"];
const rowKey = (routeId: number, side: ProgressSide): string =>
  `${routeId}:${side}`;

const flatten = (byRoute: ProgressByRoute): ProgressEntry[] =>
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

const rebuild = (entries: ProgressEntry[]): ProgressByRoute =>
  entries.reduce<ProgressByRoute>((acc, e) => {
    acc[e.routeId] = {
      ...(acc[e.routeId] ?? {}),
      [e.side]: { position: e.position, updatedAt: e.updatedAt },
    };
    return acc;
  }, {});

export type ProgressMerge = {
  // The reconciled state to write back into the local store.
  merged: ProgressByRoute;
  // Entries where the local copy is newer (or the server lacks it) — upsert.
  toPush: ProgressEntry[];
};

/**
 * Merges local progress with the server's rows, last-write-wins per
 * (routeId, side). Union of both sides; ties keep the local value.
 */
export const mergeProgress = (
  local: ProgressByRoute,
  remote: RemoteProgressRow[],
): ProgressMerge => {
  const localByKey = new Map(
    flatten(local).map((e) => [rowKey(e.routeId, e.side), e]),
  );
  const remoteByKey = new Map(
    remote.map((r): [string, ProgressEntry] => [
      rowKey(r.route_id, r.side),
      {
        routeId: r.route_id,
        side: r.side,
        position: r.position,
        updatedAt: Date.parse(r.updated_at),
      },
    ]),
  );

  type Decision = {
    winner: ProgressEntry;
    fromLocal: boolean;
    remote: ProgressEntry | undefined;
  };

  const keys = new Set([...localByKey.keys(), ...remoteByKey.keys()]);
  const decisions = [...keys].flatMap((k): Decision[] => {
    const l = localByKey.get(k);
    const r = remoteByKey.get(k);
    if (l && r) {
      return [
        l.updatedAt >= r.updatedAt
          ? { winner: l, fromLocal: true, remote: r }
          : { winner: r, fromLocal: false, remote: r },
      ];
    }
    if (l) return [{ winner: l, fromLocal: true, remote: undefined }];
    if (r) return [{ winner: r, fromLocal: false, remote: r }];
    return [];
  });

  return {
    merged: rebuild(decisions.map((d) => d.winner)),
    toPush: decisions
      .filter(
        (d) =>
          d.fromLocal && (!d.remote || d.winner.updatedAt > d.remote.updatedAt),
      )
      .map((d) => d.winner),
  };
};

export type ProgressDelta = {
  upserts: ProgressEntry[];
  deletes: { routeId: number; side: ProgressSide }[];
};

/** Rows to upsert/delete to move the server from `prev` to `next`. */
export const diffProgress = (
  prev: ProgressByRoute,
  next: ProgressByRoute,
): ProgressDelta => {
  const prevByKey = new Map(
    flatten(prev).map((e) => [rowKey(e.routeId, e.side), e]),
  );
  const nextByKey = new Map(
    flatten(next).map((e) => [rowKey(e.routeId, e.side), e]),
  );

  const upserts = [...nextByKey.values()].filter((n) => {
    const p = prevByKey.get(rowKey(n.routeId, n.side));
    return !p || p.position !== n.position || p.updatedAt !== n.updatedAt;
  });
  const deletes = [...prevByKey.values()]
    .filter((p) => !nextByKey.has(rowKey(p.routeId, p.side)))
    .map((p) => ({ routeId: p.routeId, side: p.side }));

  return { upserts, deletes };
};

export type LocalPreferences = {
  japanese: boolean;
  hiddenGenres: string[];
  updatedAt: number;
};

// Shape of the `user_preferences` row as returned by PostgREST (null when the
// user has none yet).
export type RemotePreferences = {
  japanese: boolean;
  hidden_genres: string[];
  updated_at: string;
} | null;

export type PreferencesMerge = {
  merged: LocalPreferences;
  pushLocal: boolean;
};

/** Last-write-wins for the single preferences row. */
export const mergePreferences = (
  local: LocalPreferences,
  remote: RemotePreferences,
): PreferencesMerge => {
  if (!remote) return { merged: local, pushLocal: true };
  const remoteUpdatedAt = Date.parse(remote.updated_at);
  if (remoteUpdatedAt > local.updatedAt) {
    return {
      merged: {
        japanese: remote.japanese,
        hiddenGenres: remote.hidden_genres,
        updatedAt: remoteUpdatedAt,
      },
      pushLocal: false,
    };
  }
  return { merged: local, pushLocal: local.updatedAt > remoteUpdatedAt };
};
