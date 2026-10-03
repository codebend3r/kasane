import { describe, expect, it } from "bun:test";
import {
  buildSyntheticMapping,
  pairResults,
  partnerIdOf,
  seriesBadgeOf,
} from "./pairing";
import { makeMedia } from "@test/fixtures/media";

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

describe("partnerIdOf", () => {
  it("reads a manga's anime adaptation", () => {
    const manga = makeMedia({
      id: 2,
      type: "MANGA",
      relations: [
        { relationType: "ADAPTATION", node: { id: 1, type: "ANIME" } },
      ],
    });
    expect(partnerIdOf(manga)).toBe(1);
  });

  it("reads an anime's source manga", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [{ relationType: "SOURCE", node: { id: 2, type: "MANGA" } }],
    });
    expect(partnerIdOf(anime)).toBe(2);
  });

  it("ignores a relation pointing the wrong way", () => {
    // An anime's ADAPTATION edge is a spin-off, not its source.
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [
        { relationType: "ADAPTATION", node: { id: 2, type: "MANGA" } },
      ],
    });
    expect(partnerIdOf(anime)).toBeNull();
  });
});

describe("seriesBadgeOf", () => {
  it("is both when the media has a partner", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [{ relationType: "SOURCE", node: { id: 2, type: "MANGA" } }],
    });
    expect(seriesBadgeOf(anime)).toBe("both");
  });

  it("names the media's own side when it has no partner", () => {
    expect(seriesBadgeOf(makeMedia({ id: 1, type: "ANIME" }))).toBe(
      "anime-only",
    );
    expect(seriesBadgeOf(makeMedia({ id: 2, type: "MANGA" }))).toBe(
      "manga-only",
    );
  });
});
