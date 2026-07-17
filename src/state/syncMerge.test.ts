import {
  diffProgress,
  mergePreferences,
  mergeProgress,
  type ProgressByRoute,
  type RemoteProgressRow,
} from "./syncMerge";

const iso = (ms: number): string => new Date(ms).toISOString();

describe("mergeProgress", () => {
  it("pulls a remote-only entry into the merged state", () => {
    const remote: RemoteProgressRow[] = [
      { route_id: 21, side: "anime", position: 10, updated_at: iso(1000) },
    ];
    const { merged, toPush } = mergeProgress({}, remote);
    expect(merged).toEqual({
      21: { anime: { position: 10, updatedAt: 1000 } },
    });
    expect(toPush).toEqual([]);
  });

  it("pushes a local-only entry", () => {
    const local: ProgressByRoute = {
      21: { anime: { position: 5, updatedAt: 2000 } },
    };
    const { merged, toPush } = mergeProgress(local, []);
    expect(merged).toEqual(local);
    expect(toPush).toEqual([
      { routeId: 21, side: "anime", position: 5, updatedAt: 2000 },
    ]);
  });

  it("keeps the newer side per route on conflict", () => {
    const local: ProgressByRoute = {
      21: {
        anime: { position: 5, updatedAt: 3000 }, // local newer
        manga: { position: 2, updatedAt: 1000 }, // remote newer
      },
    };
    const remote: RemoteProgressRow[] = [
      { route_id: 21, side: "anime", position: 4, updated_at: iso(2000) },
      { route_id: 21, side: "manga", position: 9, updated_at: iso(4000) },
    ];
    const { merged, toPush } = mergeProgress(local, remote);
    expect(merged).toEqual({
      21: {
        anime: { position: 5, updatedAt: 3000 },
        manga: { position: 9, updatedAt: 4000 },
      },
    });
    expect(toPush).toEqual([
      { routeId: 21, side: "anime", position: 5, updatedAt: 3000 },
    ]);
  });

  it("does not push when timestamps tie", () => {
    const local: ProgressByRoute = {
      7: { manga: { position: 3, updatedAt: 1500 } },
    };
    const remote: RemoteProgressRow[] = [
      { route_id: 7, side: "manga", position: 3, updated_at: iso(1500) },
    ];
    expect(mergeProgress(local, remote).toPush).toEqual([]);
  });
});

describe("diffProgress", () => {
  it("flags added and changed entries as upserts", () => {
    const prev: ProgressByRoute = {
      1: { anime: { position: 1, updatedAt: 100 } },
    };
    const next: ProgressByRoute = {
      1: { anime: { position: 2, updatedAt: 200 } }, // changed
      2: { manga: { position: 9, updatedAt: 300 } }, // added
    };
    const { upserts, deletes } = diffProgress(prev, next);
    expect(upserts).toEqual([
      { routeId: 1, side: "anime", position: 2, updatedAt: 200 },
      { routeId: 2, side: "manga", position: 9, updatedAt: 300 },
    ]);
    expect(deletes).toEqual([]);
  });

  it("flags removed entries as deletes", () => {
    const prev: ProgressByRoute = {
      1: {
        anime: { position: 1, updatedAt: 100 },
        manga: { position: 5, updatedAt: 100 },
      },
    };
    const next: ProgressByRoute = {
      1: { anime: { position: 1, updatedAt: 100 } },
    };
    const { upserts, deletes } = diffProgress(prev, next);
    expect(upserts).toEqual([]);
    expect(deletes).toEqual([{ routeId: 1, side: "manga" }]);
  });
});

describe("mergePreferences", () => {
  const local = { japanese: true, hiddenGenres: ["horror"], updatedAt: 2000 };

  it("pushes local when the server has no row", () => {
    expect(mergePreferences(local, null)).toEqual({
      merged: local,
      pushLocal: true,
    });
  });

  it("adopts the server copy when it is newer", () => {
    const merge = mergePreferences(local, {
      japanese: false,
      hidden_genres: ["isekai"],
      updated_at: iso(5000),
    });
    expect(merge).toEqual({
      merged: { japanese: false, hiddenGenres: ["isekai"], updatedAt: 5000 },
      pushLocal: false,
    });
  });

  it("pushes local when it is newer than the server copy", () => {
    const merge = mergePreferences(local, {
      japanese: false,
      hidden_genres: [],
      updated_at: iso(1000),
    });
    expect(merge).toEqual({ merged: local, pushLocal: true });
  });
});
