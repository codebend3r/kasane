import { splitHiddenForAniList, type GenreFilter } from "./genreFilters";

// A representative slice of the `genre_filters` table (the full catalog now
// lives in Supabase; these fixtures exercise the pure bucketing logic).
const FILTERS: readonly GenreFilter[] = [
  { id: "horror", label: "Horror", kind: "genre", token: "Horror" },
  { id: "isekai", label: "Isekai", kind: "tag", token: "Isekai" },
  { id: "bl", label: "BL", kind: "tag", token: "Boys' Love" },
];

describe("splitHiddenForAniList", () => {
  it("always injects Ecchi and Hentai into genreNotIn for an empty selection", () => {
    expect(splitHiddenForAniList([], FILTERS)).toEqual({
      genreNotIn: ["Ecchi", "Hentai"],
      tagNotIn: null,
    });
  });

  it("routes a genre id into genreNotIn alongside the always-hidden genres", () => {
    expect(splitHiddenForAniList(["horror"], FILTERS)).toEqual({
      genreNotIn: ["Ecchi", "Hentai", "Horror"],
      tagNotIn: null,
    });
  });

  it("routes a tag id into tagNotIn while still hiding Ecchi and Hentai", () => {
    expect(splitHiddenForAniList(["isekai"], FILTERS)).toEqual({
      genreNotIn: ["Ecchi", "Hentai"],
      tagNotIn: ["Isekai"],
    });
  });

  it("splits mixed selections into the right buckets", () => {
    const out = splitHiddenForAniList(["isekai", "horror", "bl"], FILTERS);
    expect(out.genreNotIn?.sort()).toEqual(["Ecchi", "Hentai", "Horror"]);
    expect(out.tagNotIn?.sort()).toEqual(["Boys' Love", "Isekai"]);
  });

  it("produces stable output regardless of input order", () => {
    const a = splitHiddenForAniList(["horror", "isekai"], FILTERS);
    const b = splitHiddenForAniList(["isekai", "horror"], FILTERS);
    expect(a).toEqual(b);
  });

  it("ignores unknown ids without throwing", () => {
    expect(splitHiddenForAniList(["nonexistent-id"], FILTERS)).toEqual({
      genreNotIn: ["Ecchi", "Hentai"],
      tagNotIn: null,
    });
  });
});
