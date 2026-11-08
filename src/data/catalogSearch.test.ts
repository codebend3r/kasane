import { describe, expect, it } from "bun:test";
import {
  catalogMediaIds,
  matchCatalogTitles,
  mergeSearchResults,
} from "./catalogSearch";
import { makeMedia } from "@test/fixtures/media";
import type { SeriesMapping } from "@/types";

const series = ({
  title,
  anime,
  manga,
}: {
  title: string;
  anime: number;
  manga: number;
}): SeriesMapping => ({
  title,
  anilistAnimeId: anime,
  anilistMangaId: manga,
  mappings: [],
  movies: [],
});

const twoHit = series({
  title: "Do You Love Your Mom and Her Two-Hit Multi-Target Attacks?",
  anime: 104723,
  manga: 98280,
});
const aot = series({ title: "Attack on Titan", anime: 16498, manga: 53390 });
const counter = series({ title: "Counterattack", anime: 1, manga: 2 });
const naruto = series({ title: "Naruto", anime: 20, manga: 30 });
const mappings = [twoHit, counter, naruto, aot];

describe("matchCatalogTitles", () => {
  it("finds Attack on Titan for a partial query", () => {
    expect(matchCatalogTitles({ query: "attack", mappings })).toContain(aot);
  });

  it("ranks title prefix, then word prefix, then substring", () => {
    expect(matchCatalogTitles({ query: "attack", mappings })).toEqual([
      aot,
      twoHit,
      counter,
    ]);
  });

  it("ignores case and punctuation", () => {
    expect(matchCatalogTitles({ query: "  ATTACK-on ", mappings })).toEqual([
      aot,
    ]);
  });

  it("returns nothing for a one-character or empty query", () => {
    expect(matchCatalogTitles({ query: "a", mappings })).toEqual([]);
    expect(matchCatalogTitles({ query: " ", mappings })).toEqual([]);
  });

  it("returns nothing when no title matches", () => {
    expect(matchCatalogTitles({ query: "bleach", mappings })).toEqual([]);
  });

  it("caps the matches at the limit", () => {
    expect(matchCatalogTitles({ query: "attack", mappings, limit: 1 })).toEqual(
      [aot],
    );
  });
});

describe("catalogMediaIds", () => {
  it("lists anime then manga ids for each match, without repeats", () => {
    expect(catalogMediaIds([aot, aot, naruto])).toEqual([16498, 53390, 20, 30]);
  });
});

describe("mergeSearchResults", () => {
  it("puts catalog media first in id order and drops repeats", () => {
    const anime = makeMedia({ id: 16498, type: "ANIME" });
    const manga = makeMedia({ id: 53390, type: "MANGA" });
    const other = makeMedia({ id: 55391, type: "MANGA" });
    expect(
      mergeSearchResults({
        ids: [16498, 53390],
        catalogMedia: [manga, anime],
        searchMedia: [other, anime],
      }).map((m) => m.id),
    ).toEqual([16498, 53390, 55391]);
  });

  it("skips ids AniList did not return, such as a hidden genre", () => {
    const other = makeMedia({ id: 55391, type: "MANGA" });
    expect(
      mergeSearchResults({
        ids: [16498],
        catalogMedia: [],
        searchMedia: [other],
      }).map((m) => m.id),
    ).toEqual([55391]);
  });
});
