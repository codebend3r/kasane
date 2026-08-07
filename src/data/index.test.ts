import { describe, expect, it } from "bun:test";
import {
  buildSyntheticMapping,
  chapterToEpisodes,
  episodeToChapters,
  pairResults,
} from "./index";
import type {
  AniListMedia,
  MediaType,
  RelationEdge,
  SeriesMapping,
} from "@/types";

const makeMedia = ({
  id,
  type,
  title,
  episodes = null,
  chapters = null,
  startYear = null,
  relations,
}: {
  id: number;
  type: MediaType;
  title?: string;
  episodes?: number | null;
  chapters?: number | null;
  startYear?: number | null;
  relations?: RelationEdge[];
}): AniListMedia => ({
  id,
  type,
  title: { romaji: title ?? `Media ${id}`, english: null, native: null },
  coverImage: { large: "https://img.example/cover.png", color: null },
  description: null,
  episodes,
  chapters,
  volumes: null,
  status: null,
  format: null,
  countryOfOrigin: null,
  synonyms: [],
  genres: [],
  startDate: { year: startYear },
  ...(relations ? { relations: { edges: relations } } : {}),
});

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

describe("pairResults", () => {
  it("absorbs an anime into its source manga entry", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [{ relationType: "SOURCE", node: { id: 2, type: "MANGA" } }],
    });
    const manga = makeMedia({
      id: 2,
      type: "MANGA",
      relations: [
        { relationType: "ADAPTATION", node: { id: 1, type: "ANIME" } },
      ],
    });

    expect(pairResults([anime, manga])).toEqual([
      { routeId: 2, primary: manga, manga, anime, badge: "both" },
    ]);
  });

  it("keeps an anime with no source manga as anime-only", () => {
    const anime = makeMedia({ id: 1, type: "ANIME" });

    expect(pairResults([anime])).toEqual([
      { routeId: 1, primary: anime, manga: null, anime, badge: "anime-only" },
    ]);
  });

  it("keeps a manga with no adaptation as manga-only", () => {
    const manga = makeMedia({ id: 2, type: "MANGA" });

    expect(pairResults([manga])).toEqual([
      { routeId: 2, primary: manga, manga, anime: null, badge: "manga-only" },
    ]);
  });

  it("routes an anime to its source manga even when the manga is not in the results", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [{ relationType: "SOURCE", node: { id: 99, type: "MANGA" } }],
    });

    expect(pairResults([anime])).toEqual([
      { routeId: 99, primary: anime, manga: null, anime, badge: "both" },
    ]);
  });

  it("collapses several anime sharing one source manga to one entry, keeping the first", () => {
    const seasonOne = makeMedia({
      id: 10,
      type: "ANIME",
      relations: [{ relationType: "SOURCE", node: { id: 99, type: "MANGA" } }],
    });
    const seasonTwo = makeMedia({
      id: 11,
      type: "ANIME",
      relations: [{ relationType: "SOURCE", node: { id: 99, type: "MANGA" } }],
    });
    const manga = makeMedia({ id: 99, type: "MANGA" });

    expect(pairResults([seasonOne, seasonTwo, manga])).toEqual([
      {
        routeId: 99,
        primary: manga,
        manga,
        anime: seasonOne,
        badge: "both",
      },
    ]);
  });
});

describe("buildSyntheticMapping", () => {
  const autoNote =
    "Auto-estimated linear mapping — anime episode count distributed evenly across the manga chapter count. Real arc pacing is rarely uniform.";

  it("returns null when the media has no relations", () => {
    expect(
      buildSyntheticMapping(makeMedia({ id: 1, type: "ANIME" })),
    ).toBeNull();
  });

  it("returns null when no partner of the opposite type qualifies", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      episodes: 12,
      relations: [
        // Wrong node type for an anime's partner.
        {
          relationType: "SOURCE",
          node: { id: 2, type: "ANIME", episodes: 24 },
        },
        // Right type but not a partner relation.
        {
          relationType: "SIDE_STORY",
          node: { id: 3, type: "MANGA", chapters: 50 },
        },
        // Partner relation but no chapter count to map against.
        {
          relationType: "SOURCE",
          node: { id: 4, type: "MANGA", chapters: null },
        },
      ],
    });
    expect(buildSyntheticMapping(anime)).toBeNull();
  });

  it("returns null when the media's own count is missing", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      episodes: null,
      relations: [
        {
          relationType: "SOURCE",
          node: { id: 2, type: "MANGA", chapters: 100 },
        },
      ],
    });
    expect(buildSyntheticMapping(anime)).toBeNull();
  });

  it("maps [1, episodes] to [1, chapters] for an anime and its source manga", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      title: "Adapted",
      episodes: 24,
      relations: [
        {
          relationType: "SOURCE",
          node: {
            id: 2,
            type: "MANGA",
            chapters: 96,
            startDate: { year: 2000 },
          },
        },
      ],
    });

    expect(buildSyntheticMapping(anime)).toEqual({
      anilistAnimeId: 1,
      anilistMangaId: 2,
      title: "Adapted",
      sourceNotes: autoNote,
      mappings: [
        { episodes: [1, 24], chapters: [1, 96], arc: "Full series (auto)" },
      ],
    });
  });

  it("maps a manga to its earliest anime adaptation", () => {
    const manga = makeMedia({
      id: 2,
      type: "MANGA",
      title: "Source",
      chapters: 96,
      relations: [
        {
          relationType: "ADAPTATION",
          node: {
            id: 30,
            type: "ANIME",
            episodes: 12,
            startDate: { year: 2015 },
          },
        },
        {
          relationType: "ADAPTATION",
          node: {
            id: 20,
            type: "ANIME",
            episodes: 26,
            startDate: { year: 1999 },
          },
        },
      ],
    });

    expect(buildSyntheticMapping(manga)).toEqual({
      anilistAnimeId: 20,
      anilistMangaId: 2,
      title: "Source",
      sourceNotes: autoNote,
      mappings: [
        { episodes: [1, 26], chapters: [1, 96], arc: "Full series (auto)" },
      ],
    });
  });

  it("sorts a partner with no start year after dated partners", () => {
    const manga = makeMedia({
      id: 2,
      type: "MANGA",
      title: "Source",
      chapters: 50,
      relations: [
        {
          relationType: "ADAPTATION",
          node: { id: 40, type: "ANIME", episodes: 13 },
        },
        {
          relationType: "ADAPTATION",
          node: {
            id: 41,
            type: "ANIME",
            episodes: 25,
            startDate: { year: 2005 },
          },
        },
      ],
    });

    expect(buildSyntheticMapping(manga)?.anilistAnimeId ?? null).toBe(41);
  });
});
