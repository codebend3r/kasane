import {
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

const show = (title: string, episodes: number): MappedShow => ({
  routeId: 1,
  title,
  episodes,
  chapters: 0,
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
    show("Berserk", 25),
    show("Attack on Titan", 98),
    show("Chainsaw Man", 12),
  ];

  it("sorts alphabetically", () => {
    expect(sortMappedShows(shows, "alpha").map((s) => s.title)).toEqual([
      "Attack on Titan",
      "Berserk",
      "Chainsaw Man",
    ]);
  });

  it("sorts by episode count, highest first", () => {
    expect(sortMappedShows(shows, "episodes").map((s) => s.title)).toEqual([
      "Attack on Titan",
      "Berserk",
      "Chainsaw Man",
    ]);
  });

  it("breaks episode ties alphabetically", () => {
    const tied = [show("Zeta", 12), show("Alpha", 12), show("Mid", 40)];
    expect(sortMappedShows(tied, "episodes").map((s) => s.title)).toEqual([
      "Mid",
      "Alpha",
      "Zeta",
    ]);
  });

  it("does not mutate the input", () => {
    const original = [...shows];
    sortMappedShows(shows, "alpha");
    expect(shows).toEqual(original);
  });
});
