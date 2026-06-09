import { GENRE_FILTERS, splitHiddenForAniList } from "./genreFilters";

describe("GENRE_FILTERS catalog", () => {
  it("has 27 entries", () => {
    expect(GENRE_FILTERS).toHaveLength(27);
  });

  it("has unique ids", () => {
    const ids = GENRE_FILTERS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique tokens within each kind", () => {
    const genres = GENRE_FILTERS.filter((f) => f.kind === "genre").map(
      (f) => f.token,
    );
    const tags = GENRE_FILTERS.filter((f) => f.kind === "tag").map(
      (f) => f.token,
    );
    expect(new Set(genres).size).toBe(genres.length);
    expect(new Set(tags).size).toBe(tags.length);
  });

  it("does not expose Ecchi as a toggleable chip", () => {
    expect(GENRE_FILTERS.find((f) => f.id === "ecchi")).toBeUndefined();
  });

  it("does not expose Hentai as a toggleable chip", () => {
    expect(GENRE_FILTERS.find((f) => f.id === "hentai")).toBeUndefined();
  });

  it('contains BL with token "Boys\' Love"', () => {
    const bl = GENRE_FILTERS.find((f) => f.id === "bl");
    expect(bl?.kind).toBe("tag");
    expect(bl?.token).toBe("Boys' Love");
  });
});

describe("splitHiddenForAniList", () => {
  it("always injects Ecchi and Hentai into genreNotIn for an empty selection", () => {
    expect(splitHiddenForAniList([])).toEqual({
      genreNotIn: ["Ecchi", "Hentai"],
      tagNotIn: null,
    });
  });

  it("routes a genre id into genreNotIn alongside the always-hidden genres", () => {
    expect(splitHiddenForAniList(["horror"])).toEqual({
      genreNotIn: ["Ecchi", "Hentai", "Horror"],
      tagNotIn: null,
    });
  });

  it("routes a tag id into tagNotIn while still hiding Ecchi and Hentai", () => {
    expect(splitHiddenForAniList(["isekai"])).toEqual({
      genreNotIn: ["Ecchi", "Hentai"],
      tagNotIn: ["Isekai"],
    });
  });

  it("splits mixed selections into the right buckets", () => {
    const out = splitHiddenForAniList(["isekai", "horror", "bl"]);
    expect(out.genreNotIn?.sort()).toEqual(["Ecchi", "Hentai", "Horror"]);
    expect(out.tagNotIn?.sort()).toEqual(["Boys' Love", "Isekai"]);
  });

  it("produces stable output regardless of input order", () => {
    const a = splitHiddenForAniList(["horror", "isekai"]);
    const b = splitHiddenForAniList(["isekai", "horror"]);
    expect(a).toEqual(b);
  });

  it("ignores unknown ids without throwing", () => {
    expect(splitHiddenForAniList(["nonexistent-id"])).toEqual({
      genreNotIn: ["Ecchi", "Hentai"],
      tagNotIn: null,
    });
  });
});
