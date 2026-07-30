import {
  DEFAULT_SORT,
  nextSort,
  sortMappedShows,
  toMappedShow,
  type MappedShow,
} from "@/data/mappedShows";
import type { SeriesMapping } from "@/types";

const series: SeriesMapping = {
  anilistAnimeId: 16498,
  anilistMangaId: 53390,
  title: "Attack on Titan",
  mappings: [
    { chapters: [1, 8], episodes: [1, 2], arc: "Fall of Shiganshina" },
    { chapters: [9, 34], episodes: [3, 13], arc: "Battle of Trost" },
    // Unadapted tail — chapters only, so it must not affect the episode count.
    { chapters: [35, 139] },
  ],
};

const show = (title: string, episodes: number, chapters = 0): MappedShow => ({
  key: `k-${title}`,
  routeId: 1,
  coverId: 2,
  title,
  episodes,
  chapters,
  arcs: 0,
});

describe("toMappedShow", () => {
  it("takes the highest episode and chapter across the arcs", () => {
    const m = toMappedShow(series);
    expect(m.episodes).toBe(13);
    expect(m.chapters).toBe(139);
    expect(m.arcs).toBe(3);
  });

  it("keys on the manga id so it matches how progress is stored", () => {
    expect(toMappedShow(series).routeId).toBe(53390);
  });

  // Several catalog entries share a manga id (one source adapted more than
  // once), which duplicated React keys and warned in the console.
  it("gives series sharing a manga id distinct list keys", () => {
    const sibling = { ...series, anilistAnimeId: 999, title: "AoT: Final" };
    const a = toMappedShow(series);
    const b = toMappedShow(sibling);
    expect(a.routeId).toBe(b.routeId);
    expect(a.key).not.toBe(b.key);
  });

  it("reports zero episodes for a manga with no adapted arcs", () => {
    const mangaOnly: SeriesMapping = {
      ...series,
      mappings: [{ chapters: [1, 20] }],
    };
    expect(toMappedShow(mangaOnly).episodes).toBe(0);
  });
});

describe("sortMappedShows", () => {
  const shows = [
    show("Berserk", 25, 383),
    show("Attack on Titan", 98, 139),
    show("Chainsaw Man", 12, 232),
  ];
  const titles = (sort: Parameters<typeof sortMappedShows>[1]) =>
    sortMappedShows(shows, sort).map((s) => s.title);

  it("sorts alphabetically", () => {
    expect(titles({ field: "alpha", direction: "asc" })).toEqual([
      "Attack on Titan",
      "Berserk",
      "Chainsaw Man",
    ]);
  });

  it("reverses the alphabetical order when descending", () => {
    expect(titles({ field: "alpha", direction: "desc" })).toEqual([
      "Chainsaw Man",
      "Berserk",
      "Attack on Titan",
    ]);
  });

  it("sorts by episode count in both directions", () => {
    expect(titles({ field: "episodes", direction: "desc" })).toEqual([
      "Attack on Titan",
      "Berserk",
      "Chainsaw Man",
    ]);
    expect(titles({ field: "episodes", direction: "asc" })).toEqual([
      "Chainsaw Man",
      "Berserk",
      "Attack on Titan",
    ]);
  });

  it("sorts by chapter count in both directions", () => {
    expect(titles({ field: "chapters", direction: "desc" })).toEqual([
      "Berserk",
      "Chainsaw Man",
      "Attack on Titan",
    ]);
    expect(titles({ field: "chapters", direction: "asc" })).toEqual([
      "Attack on Titan",
      "Chainsaw Man",
      "Berserk",
    ]);
  });

  // A descending count column should not also flip the names inside a tie.
  it("breaks ties alphabetically in either direction", () => {
    const tied = [show("Zeta", 12), show("Alpha", 12), show("Mid", 40)];
    expect(
      sortMappedShows(tied, { field: "episodes", direction: "desc" }).map(
        (s) => s.title,
      ),
    ).toEqual(["Mid", "Alpha", "Zeta"]);
    expect(
      sortMappedShows(tied, { field: "episodes", direction: "asc" }).map(
        (s) => s.title,
      ),
    ).toEqual(["Alpha", "Zeta", "Mid"]);
  });

  it("does not mutate the input", () => {
    const original = [...shows];
    sortMappedShows(shows, DEFAULT_SORT);
    expect(shows).toEqual(original);
  });
});

describe("nextSort", () => {
  it("flips direction when the same column is pressed again", () => {
    expect(nextSort({ field: "alpha", direction: "asc" }, "alpha")).toEqual({
      field: "alpha",
      direction: "desc",
    });
    expect(nextSort({ field: "alpha", direction: "desc" }, "alpha")).toEqual({
      field: "alpha",
      direction: "asc",
    });
  });

  it("opens counts biggest-first and titles A–Z", () => {
    expect(nextSort({ field: "alpha", direction: "desc" }, "episodes")).toEqual(
      {
        field: "episodes",
        direction: "desc",
      },
    );
    expect(nextSort({ field: "alpha", direction: "asc" }, "chapters")).toEqual({
      field: "chapters",
      direction: "desc",
    });
    expect(nextSort({ field: "episodes", direction: "asc" }, "alpha")).toEqual({
      field: "alpha",
      direction: "asc",
    });
  });
});
