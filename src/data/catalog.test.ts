import { describe, expect, it } from "bun:test";
import {
  indexByMediaId,
  rowToMapping,
  toAliasTable,
  toGenreFilter,
} from "@/data/catalog";
import { genreRows, seriesMapping, seriesRow } from "@test/fixtures/catalog";
import type { SeriesMapping } from "@/types";

const aot: SeriesMapping = {
  anilistAnimeId: 16498,
  anilistMangaId: 53390,
  title: "Attack on Titan",
  mappings: [
    { chapters: [1, 8], episodes: [1, 2], arc: "Fall of Shiganshina" },
  ],
};

const onePiece: SeriesMapping = {
  anilistAnimeId: 21,
  anilistMangaId: 30013,
  title: "One Piece",
  mappings: [{ chapters: [1, 7], episodes: [1, 3], arc: "Romance Dawn" }],
};

describe("rowToMapping", () => {
  it("sorts arcs and films by position and turns null bounds into undefined", () => {
    expect(rowToMapping(seriesRow)).toEqual(seriesMapping);
  });

  it("leaves `movies` undefined for a series with no films", () => {
    expect(rowToMapping({ ...seriesRow, movies: [] }).movies).toBeUndefined();
  });
});

describe("toAliasTable", () => {
  it("keys each target by its alias", () => {
    expect(
      toAliasTable([
        { alias: "aot", target: "Attack on Titan" },
        { alias: "mha", target: "My Hero Academia" },
      ]),
    ).toEqual({ aot: "Attack on Titan", mha: "My Hero Academia" });
  });
});

describe("toGenreFilter", () => {
  it("keeps known kinds and degrades unknown kinds to genre", () => {
    expect(genreRows.map(toGenreFilter)).toEqual([
      { id: "hentai", kind: "genre", label: "Hentai", token: "Hentai" },
      { id: "ecchi", kind: "tag", label: "Ecchi", token: "Ecchi" },
      { id: "odd", kind: "genre", label: "Odd", token: "Odd" },
    ]);
  });
});

describe("indexByMediaId", () => {
  it("resolves a series by its anime id and by its manga id", () => {
    const index = indexByMediaId([aot, onePiece]);
    expect(index.get(16498)?.title).toBe("Attack on Titan");
    expect(index.get(53390)?.title).toBe("Attack on Titan");
    expect(index.get(21)?.title).toBe("One Piece");
    expect(index.get(999999)).toBeUndefined();
  });

  it("keeps the first-listed series when two share a media id", () => {
    const shared: SeriesMapping = { ...onePiece, anilistMangaId: 53390 };
    const index = indexByMediaId([aot, shared]);
    expect(index.get(53390)?.title).toBe("Attack on Titan");
  });

  // Regression guard. The catalog query is persisted to AsyncStorage as JSON,
  // and a `Map` does not survive that round trip. The index must be buildable
  // from the restored plain payload.
  it("resolves from mappings that went through a JSON round trip", () => {
    const persisted = JSON.parse(JSON.stringify({ mappings: [aot, onePiece] }));
    const index = indexByMediaId(persisted.mappings);
    expect(index).toBeInstanceOf(Map);
    expect(index.get(53390)?.title).toBe("Attack on Titan");
  });
});
