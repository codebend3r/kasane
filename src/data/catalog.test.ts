// `@/data/catalog` pulls in the Supabase client, which reaches for a native
// storage module that doesn't exist under jest. The index is pure, so an empty
// stub is enough.
jest.mock("@/api/supabase", () => ({ supabase: {} }));

import { indexByMediaId } from "@/data/catalog";
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

  it("reuses the index for the same array instance", () => {
    const mappings = [aot, onePiece];
    expect(indexByMediaId(mappings)).toBe(indexByMediaId(mappings));
  });

  // Regression guard. The catalog query is persisted to AsyncStorage as JSON,
  // and a `Map` does not survive that round trip — it serializes to `{}`. When
  // the index was stored on the query payload, every cold launch restored it as
  // a plain object and `byMediaId.get(...)` threw, taking down the series
  // screen. Deriving the index from `mappings` keeps it a real Map.
  it("still resolves after the JSON round trip the query cache performs", () => {
    const persisted = JSON.parse(JSON.stringify({ mappings: [aot, onePiece] }));
    const index = indexByMediaId(persisted.mappings);
    expect(index).toBeInstanceOf(Map);
    expect(index.get(16498)?.title).toBe("Attack on Titan");
    expect(index.get(53390)?.title).toBe("Attack on Titan");
  });
});
