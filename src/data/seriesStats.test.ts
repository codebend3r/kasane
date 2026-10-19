import { describe, expect, it } from "bun:test";
import { cardStats, detailStats, episodeTotal } from "./seriesStats";
import { toSeriesEntry } from "@/data/pairing";
import { makeMedia } from "@test/fixtures/media";
import type { AniListMedia, SeriesMapping } from "@/types";

const anime: AniListMedia = {
  ...makeMedia({ id: 1, type: "ANIME", episodes: 24, startYear: 2019 }),
  format: "TV",
};
const manga: AniListMedia = {
  ...makeMedia({ id: 2, type: "MANGA", chapters: 120, startYear: 2016 }),
  format: "MANGA",
  status: "RELEASING",
};

const both = toSeriesEntry({ media: anime, partnerId: 2, partner: manga });

const mapping: SeriesMapping = {
  anilistAnimeId: 1,
  anilistMangaId: 2,
  title: "Test",
  mappings: [
    { episodes: [1, 12], chapters: [1, 40] },
    { episodes: [13, 26], chapters: [41, 80] },
    { chapters: [81, 120] },
  ],
  movies: [{ title: "Film", year: 2021 }],
};

describe("episodeTotal", () => {
  it("reaches as far as the mapping does, past AniList's count", () => {
    expect(episodeTotal({ entry: both, mapping })).toBe(26);
  });

  it("falls back to AniList's count without a mapping", () => {
    expect(episodeTotal({ entry: both, mapping: null })).toBe(24);
  });

  it("falls back to AniList when nothing in the mapping is adapted", () => {
    const unadapted: SeriesMapping = {
      ...mapping,
      mappings: [{ chapters: [1, 40] }],
    };
    expect(episodeTotal({ entry: both, mapping: unadapted })).toBe(24);
  });

  it("is null for a manga with no anime", () => {
    const mangaOnly = toSeriesEntry({
      media: manga,
      partnerId: null,
      partner: null,
    });
    expect(episodeTotal({ entry: mangaOnly, mapping: null })).toBeNull();
  });
});

describe("detailStats", () => {
  it("lists both sides' counts, the format and the start date", () => {
    expect(
      detailStats({ entry: both, mapping, chapters: 120, volumes: 12 }),
    ).toEqual(["120 ch", "12 vol", "26 eps", "1 movie", "MANGA", "2016"]);
  });

  it("marks unknown counts with a question mark", () => {
    expect(
      detailStats({
        entry: both,
        mapping: null,
        chapters: null,
        volumes: null,
      }),
    ).toEqual(["? ch", "? vol", "24 eps", "MANGA", "2016"]);
  });

  it("pluralises movies", () => {
    const twoFilms: SeriesMapping = {
      ...mapping,
      movies: [
        { title: "One", year: 2020 },
        { title: "Two", year: 2022 },
      ],
    };
    expect(
      detailStats({ entry: both, mapping: twoFilms, chapters: 1, volumes: 1 }),
    ).toContain("2 movies");
  });

  it("shows only the anime side for an anime-only series", () => {
    const animeOnly = toSeriesEntry({
      media: anime,
      partnerId: null,
      partner: null,
    });
    expect(
      detailStats({ entry: animeOnly, mapping: null, chapters: 5, volumes: 1 }),
    ).toEqual(["24 eps", "TV", "2019"]);
  });

  it("shows the status when there is no start date", () => {
    const undated: AniListMedia = { ...manga, startDate: { year: null } };
    const entry = toSeriesEntry({
      media: undated,
      partnerId: null,
      partner: null,
    });
    expect(
      detailStats({ entry, mapping: null, chapters: 120, volumes: 12 }),
    ).toEqual(["120 ch", "12 vol", "MANGA", "releasing"]);
  });
});

describe("cardStats", () => {
  it("lists episodes, chapters and the start year", () => {
    expect(cardStats({ entry: both, mapping })).toEqual([
      "26 eps",
      "120 ch",
      "2016",
    ]);
  });

  it("calls a side ongoing when AniList has no count", () => {
    const airing: AniListMedia = { ...anime, episodes: null };
    const serialising: AniListMedia = { ...manga, chapters: null };
    const entry = toSeriesEntry({
      media: airing,
      partnerId: 2,
      partner: serialising,
    });
    expect(cardStats({ entry, mapping: null })).toEqual([
      "Anime ongoing",
      "Manga ongoing",
      "2016",
    ]);
  });

  it("skips the manga side of an anime whose manga has not loaded", () => {
    const entry = toSeriesEntry({ media: anime, partnerId: 2, partner: null });
    expect(cardStats({ entry, mapping: null })).toEqual(["24 eps", "2019"]);
  });

  it("shows only the manga side of a manga-only series", () => {
    const entry = toSeriesEntry({
      media: manga,
      partnerId: null,
      partner: null,
    });
    expect(cardStats({ entry, mapping: null })).toEqual(["120 ch", "2016"]);
  });
});
