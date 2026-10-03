import { describe, expect, it } from "bun:test";
import {
  arcForChapter,
  arcForEpisode,
  chapterToEpisodes,
  episodeToChapters,
  isAdapted,
  lastMappedChapter,
  lastMappedEpisode,
  suggestPartnerMark,
} from "./mapping";
import type { MappingEntry, SeriesMapping } from "@/types";

// Season 2 starts at episode 15, leaving a gap at 13-14 (e.g. recap films),
// and the manga has published past the adapted range.
const mapping: SeriesMapping = {
  anilistAnimeId: 1,
  anilistMangaId: 2,
  title: "Test",
  mappings: [
    { episodes: [1, 12], chapters: [1, 40], arc: "First" },
    { episodes: [15, 24], chapters: [41, 80], arc: "Second" },
    { chapters: [81, 120], arc: "Unadapted tail" },
  ],
};

const overlapping: SeriesMapping = {
  anilistAnimeId: 1,
  anilistMangaId: 2,
  title: "Overlap",
  mappings: [
    { episodes: [1, 12], chapters: [1, 40], arc: "First" },
    { episodes: [10, 20], chapters: [30, 70], arc: "Overlaps first" },
  ],
};

describe("episodeToChapters", () => {
  it("resolves the first episode of an arc to that arc's chapters", () => {
    expect(episodeToChapters(mapping, 1)).toEqual([1, 40]);
  });

  it("resolves the last episode of an arc to that arc's chapters", () => {
    expect(episodeToChapters(mapping, 12)).toEqual([1, 40]);
  });

  it("resolves both boundaries of the next arc", () => {
    expect(episodeToChapters(mapping, 15)).toEqual([41, 80]);
    expect(episodeToChapters(mapping, 24)).toEqual([41, 80]);
  });

  it("returns null for an episode in the gap between arcs", () => {
    expect(episodeToChapters(mapping, 13)).toBeNull();
    expect(episodeToChapters(mapping, 14)).toBeNull();
  });

  it("returns null past the adapted range", () => {
    expect(episodeToChapters(mapping, 25)).toBeNull();
  });

  it("returns null below the first arc", () => {
    expect(episodeToChapters(mapping, 0)).toBeNull();
  });

  it("never matches an unadapted arc with no episode range", () => {
    const unadaptedOnly: SeriesMapping = {
      anilistAnimeId: 1,
      anilistMangaId: 2,
      title: "Unadapted",
      mappings: [{ chapters: [1, 40], arc: "Not yet animated" }],
    };
    expect(episodeToChapters(unadaptedOnly, 1)).toBeNull();
  });

  it("returns the first arc when ranges overlap", () => {
    expect(episodeToChapters(overlapping, 10)).toEqual([1, 40]);
  });
});

describe("chapterToEpisodes", () => {
  it("resolves both boundaries of an arc to that arc's episodes", () => {
    expect(chapterToEpisodes(mapping, 1)).toEqual([1, 12]);
    expect(chapterToEpisodes(mapping, 40)).toEqual([1, 12]);
  });

  it("resolves the first chapter of the next arc", () => {
    expect(chapterToEpisodes(mapping, 41)).toEqual([15, 24]);
  });

  it("returns null for a chapter in an unadapted arc, not the arc's chapters", () => {
    expect(chapterToEpisodes(mapping, 81)).toBeNull();
    expect(chapterToEpisodes(mapping, 120)).toBeNull();
  });

  it("returns null beyond the last arc", () => {
    expect(chapterToEpisodes(mapping, 121)).toBeNull();
  });

  it("returns the first arc when ranges overlap", () => {
    expect(chapterToEpisodes(overlapping, 35)).toEqual([1, 12]);
  });
});

describe("isAdapted", () => {
  it("accepts an arc with an episode range", () => {
    const arc: MappingEntry = { episodes: [1, 12], chapters: [1, 40] };
    expect(isAdapted(arc)).toBe(true);
  });

  it("rejects an arc the anime has not reached", () => {
    const arc: MappingEntry = { chapters: [81, 120] };
    expect(isAdapted(arc)).toBe(false);
  });
});

describe("arcForEpisode", () => {
  it("returns the whole arc, not just its chapters", () => {
    expect(arcForEpisode(mapping, 15)).toEqual({
      episodes: [15, 24],
      chapters: [41, 80],
      arc: "Second",
    });
  });

  it("returns null in a gap between arcs", () => {
    expect(arcForEpisode(mapping, 13)).toBeNull();
  });
});

describe("arcForChapter", () => {
  it("returns an unadapted arc for a chapter the anime has not reached", () => {
    expect(arcForChapter(mapping, 100)).toEqual({
      chapters: [81, 120],
      arc: "Unadapted tail",
    });
  });

  it("returns null beyond the last arc", () => {
    expect(arcForChapter(mapping, 121)).toBeNull();
  });
});

describe("lastMappedEpisode", () => {
  it("is the highest episode across adapted arcs", () => {
    expect(lastMappedEpisode(mapping)).toBe(24);
  });

  it("reads past arc order, so a reordered arc still counts", () => {
    const reordered: SeriesMapping = {
      ...mapping,
      mappings: [...mapping.mappings].reverse(),
    };
    expect(lastMappedEpisode(reordered)).toBe(24);
  });

  it("is null when no arc is adapted", () => {
    const unadapted: SeriesMapping = {
      ...mapping,
      mappings: [{ chapters: [1, 40] }],
    };
    expect(lastMappedEpisode(unadapted)).toBeNull();
  });
});

describe("lastMappedChapter", () => {
  it("is the highest chapter across every arc, adapted or not", () => {
    expect(lastMappedChapter(mapping)).toBe(120);
  });
});

describe("suggestPartnerMark", () => {
  it("suggests the last chapter an episode reaches", () => {
    expect(
      suggestPartnerMark({
        mapping,
        mark: { side: "anime", position: 15 },
        otherPosition: 0,
      }),
    ).toEqual({ side: "manga", position: 80 });
  });

  it("suggests the last episode of the arc a chapter is in", () => {
    expect(
      suggestPartnerMark({
        mapping,
        mark: { side: "manga", position: 20 },
        otherPosition: 3,
      }),
    ).toEqual({ side: "anime", position: 12 });
  });

  it("stays quiet when the other side is already that far", () => {
    expect(
      suggestPartnerMark({
        mapping,
        mark: { side: "anime", position: 12 },
        otherPosition: 40,
      }),
    ).toBeNull();
  });

  it("stays quiet when the mapping has no answer", () => {
    // Chapter 100 sits in an arc the anime has not reached.
    expect(
      suggestPartnerMark({
        mapping,
        mark: { side: "manga", position: 100 },
        otherPosition: 0,
      }),
    ).toBeNull();
  });
});
