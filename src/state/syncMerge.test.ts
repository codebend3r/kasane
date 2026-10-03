import { describe, expect, it } from "bun:test";
import {
  diffProgress,
  flattenProgress,
  mergePreferences,
  mergeProgress,
  rebuildProgress,
  type ProgressEntry,
} from "./syncMerge";
import type { PreferencesData } from "@/state/preferences";
import type { ProgressByRoute } from "@/state/progress";

describe("mergeProgress", () => {
  it("pulls a remote-only entry into the merged state", () => {
    const remote: ProgressEntry[] = [
      { routeId: 21, side: "anime", position: 10, updatedAt: 1000 },
    ];
    expect(mergeProgress({}, remote)).toEqual({
      21: { anime: { position: 10, updatedAt: 1000 } },
    });
  });

  it("keeps a local-only entry", () => {
    const local: ProgressByRoute = {
      21: { anime: { position: 5, updatedAt: 2000 } },
    };
    expect(mergeProgress(local, [])).toEqual(local);
  });

  it("keeps the newer side per route on conflict", () => {
    const local: ProgressByRoute = {
      21: {
        anime: { position: 5, updatedAt: 3000 }, // local newer
        manga: { position: 2, updatedAt: 1000 }, // remote newer
      },
    };
    const remote: ProgressEntry[] = [
      { routeId: 21, side: "anime", position: 4, updatedAt: 2000 },
      { routeId: 21, side: "manga", position: 9, updatedAt: 4000 },
    ];
    expect(mergeProgress(local, remote)).toEqual({
      21: {
        anime: { position: 5, updatedAt: 3000 },
        manga: { position: 9, updatedAt: 4000 },
      },
    });
  });

  it("keeps the local value when timestamps tie", () => {
    const local: ProgressByRoute = {
      7: { manga: { position: 3, updatedAt: 1500 } },
    };
    const remote: ProgressEntry[] = [
      { routeId: 7, side: "manga", position: 8, updatedAt: 1500 },
    ];
    expect(mergeProgress(local, remote)).toEqual(local);
  });
});

describe("flattenProgress / rebuildProgress", () => {
  it("round-trip one entry per series side", () => {
    const byRoute: ProgressByRoute = {
      1: {
        anime: { position: 3, updatedAt: 10 },
        manga: { position: 9, updatedAt: 20 },
      },
      2: { manga: { position: 4, updatedAt: 30 } },
    };
    const entries = flattenProgress(byRoute);
    expect(entries).toEqual([
      { routeId: 1, side: "anime", position: 3, updatedAt: 10 },
      { routeId: 1, side: "manga", position: 9, updatedAt: 20 },
      { routeId: 2, side: "manga", position: 4, updatedAt: 30 },
    ]);
    expect(rebuildProgress(entries)).toEqual(byRoute);
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

  // The sync controller pushes `diffProgress(serverRows, merged)` after a
  // pull, so these are exactly the rows the server is missing.
  it("after a merge, upserts only the entries this device was newer on", () => {
    const remote: ProgressEntry[] = [
      { routeId: 21, side: "anime", position: 4, updatedAt: 2000 },
      { routeId: 21, side: "manga", position: 9, updatedAt: 4000 },
    ];
    const local: ProgressByRoute = {
      21: {
        anime: { position: 5, updatedAt: 3000 },
        manga: { position: 2, updatedAt: 1000 },
      },
    };
    const server = rebuildProgress(remote);
    expect(diffProgress(server, mergeProgress(local, remote))).toEqual({
      upserts: [{ routeId: 21, side: "anime", position: 5, updatedAt: 3000 }],
      deletes: [],
    });
  });
});

describe("mergePreferences", () => {
  const local: PreferencesData = {
    japanese: true,
    hiddenGenres: ["horror"],
    updatedAt: 2000,
  };

  it("keeps local when the server has no row", () => {
    expect(mergePreferences(local, null)).toEqual(local);
  });

  it("adopts the server copy when it is newer", () => {
    const remote: PreferencesData = {
      japanese: false,
      hiddenGenres: ["isekai"],
      updatedAt: 5000,
    };
    expect(mergePreferences(local, remote)).toEqual(remote);
  });

  it("keeps local when it is newer than the server copy, or tied", () => {
    const older: PreferencesData = {
      japanese: false,
      hiddenGenres: [],
      updatedAt: 1000,
    };
    expect(mergePreferences(local, older)).toEqual(local);
    expect(mergePreferences(local, { ...older, updatedAt: 2000 })).toEqual(
      local,
    );
  });
});
