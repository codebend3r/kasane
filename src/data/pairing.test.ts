import { describe, expect, it } from "bun:test";
import {
  buildSyntheticMapping,
  pairResults,
  partnerIdFor,
  partnerIdOf,
  toSeriesEntry,
} from "./pairing";
import type { SeriesMapping } from "@/types";
import { makeEdge, makeMedia } from "@test/fixtures/media";

describe("pairResults", () => {
  it("absorbs an anime into its source manga entry", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [makeEdge({ relationType: "SOURCE", id: 2, type: "MANGA" })],
    });
    const manga = makeMedia({
      id: 2,
      type: "MANGA",
      relations: [
        makeEdge({ relationType: "ADAPTATION", id: 1, type: "ANIME" }),
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
      relations: [makeEdge({ relationType: "SOURCE", id: 99, type: "MANGA" })],
    });

    expect(pairResults([anime])).toEqual([
      { routeId: 99, primary: anime, manga: null, anime, badge: "both" },
    ]);
  });

  it("collapses several anime sharing one source manga to one entry, keeping the first", () => {
    const seasonOne = makeMedia({
      id: 10,
      type: "ANIME",
      relations: [makeEdge({ relationType: "SOURCE", id: 99, type: "MANGA" })],
    });
    const seasonTwo = makeMedia({
      id: 11,
      type: "ANIME",
      relations: [makeEdge({ relationType: "SOURCE", id: 99, type: "MANGA" })],
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

  it("returns null when the media has no relations at all", () => {
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
        makeEdge({
          relationType: "SOURCE",
          id: 2,
          type: "ANIME",
          episodes: 24,
        }),
        // Right type but not a partner relation.
        makeEdge({
          relationType: "SIDE_STORY",
          id: 3,
          type: "MANGA",
          chapters: 50,
        }),
        // Partner relation but no chapter count to map against.
        makeEdge({
          relationType: "SOURCE",
          id: 4,
          type: "MANGA",
          chapters: null,
        }),
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
        makeEdge({
          relationType: "SOURCE",
          id: 2,
          type: "MANGA",
          chapters: 100,
        }),
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
        makeEdge({
          relationType: "SOURCE",
          id: 2,
          type: "MANGA",
          chapters: 96,
          startYear: 2000,
        }),
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
      movies: [],
    });
  });

  it("maps a manga to its earliest anime adaptation", () => {
    const manga = makeMedia({
      id: 2,
      type: "MANGA",
      title: "Source",
      chapters: 96,
      relations: [
        makeEdge({
          relationType: "ADAPTATION",
          id: 30,
          type: "ANIME",
          episodes: 12,
          startYear: 2015,
        }),
        makeEdge({
          relationType: "ADAPTATION",
          id: 20,
          type: "ANIME",
          episodes: 26,
          startYear: 1999,
        }),
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
      movies: [],
    });
  });

  it("sorts a partner with no start year after dated partners", () => {
    const manga = makeMedia({
      id: 2,
      type: "MANGA",
      title: "Source",
      chapters: 50,
      relations: [
        makeEdge({
          relationType: "ADAPTATION",
          id: 40,
          type: "ANIME",
          episodes: 13,
        }),
        makeEdge({
          relationType: "ADAPTATION",
          id: 41,
          type: "ANIME",
          episodes: 25,
          startYear: 2005,
        }),
      ],
    });

    expect(buildSyntheticMapping(manga)?.anilistAnimeId ?? null).toBe(41);
  });
});

describe("partnerIdOf", () => {
  it("reads a manga's anime adaptation", () => {
    const manga = makeMedia({
      id: 2,
      type: "MANGA",
      relations: [
        makeEdge({ relationType: "ADAPTATION", id: 1, type: "ANIME" }),
      ],
    });
    expect(partnerIdOf(manga)).toBe(1);
  });

  it("reads an anime's source manga", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [makeEdge({ relationType: "SOURCE", id: 2, type: "MANGA" })],
    });
    expect(partnerIdOf(anime)).toBe(2);
  });

  it("ignores a relation pointing the wrong way", () => {
    // An anime's ADAPTATION edge is a spin-off, not its source.
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [
        makeEdge({ relationType: "ADAPTATION", id: 2, type: "MANGA" }),
      ],
    });
    expect(partnerIdOf(anime)).toBeNull();
  });
});

describe("partnerIdFor", () => {
  const curated: SeriesMapping = {
    anilistAnimeId: 10,
    anilistMangaId: 20,
    title: "Curated",
    movies: [],
    mappings: [{ episodes: [1, 12], chapters: [1, 40] }],
  };

  it("takes the other side of the curated mapping over AniList's relations", () => {
    const anime = makeMedia({
      id: 10,
      type: "ANIME",
      relations: [makeEdge({ relationType: "SOURCE", id: 99, type: "MANGA" })],
    });
    expect(partnerIdFor({ media: anime, curated })).toBe(20);
  });

  it("names the anime when the manga side is opened", () => {
    const manga = makeMedia({ id: 20, type: "MANGA" });
    expect(partnerIdFor({ media: manga, curated })).toBe(10);
  });

  it("falls back to AniList's relations without a curated mapping", () => {
    const anime = makeMedia({
      id: 10,
      type: "ANIME",
      relations: [makeEdge({ relationType: "SOURCE", id: 99, type: "MANGA" })],
    });
    expect(partnerIdFor({ media: anime, curated: null })).toBe(99);
  });
});

describe("toSeriesEntry", () => {
  const anime = makeMedia({ id: 1, type: "ANIME" });
  const manga = makeMedia({ id: 2, type: "MANGA" });

  it("keys an anime and its loaded manga on the manga", () => {
    expect(
      toSeriesEntry({ media: anime, partnerId: 2, partner: manga }),
    ).toEqual({ routeId: 2, primary: manga, manga, anime, badge: "both" });
  });

  it("keys on the partner id and calls it both while the partner loads", () => {
    expect(
      toSeriesEntry({ media: anime, partnerId: 2, partner: null }),
    ).toEqual({
      routeId: 2,
      primary: anime,
      manga: null,
      anime,
      badge: "both",
    });
  });

  it("keeps a manga's own id when it is the media", () => {
    expect(
      toSeriesEntry({ media: manga, partnerId: 1, partner: anime }),
    ).toEqual({ routeId: 2, primary: manga, manga, anime, badge: "both" });
  });

  it("ignores a partner of the same type as the media", () => {
    const otherAnime = makeMedia({ id: 3, type: "ANIME" });
    expect(
      toSeriesEntry({ media: anime, partnerId: 3, partner: otherAnime }),
    ).toEqual({
      routeId: 3,
      primary: anime,
      manga: null,
      anime,
      badge: "both",
    });
  });

  it("names the media's own side when it has no partner", () => {
    expect(
      toSeriesEntry({ media: anime, partnerId: null, partner: null }).badge,
    ).toBe("anime-only");
    expect(
      toSeriesEntry({ media: manga, partnerId: null, partner: null }).badge,
    ).toBe("manga-only");
  });
});
