import { describe, expect, it } from "bun:test";
import {
  countAggregate,
  hasVolume,
  isCoverRecord,
  isMangaRecord,
  pickBestMatch,
  preferredTitle,
} from "./mangadex";

type Record = Parameters<typeof pickBestMatch>[0][number];

const make = (overrides: { id: string; en: string; al?: string }): Record => ({
  id: overrides.id,
  attributes: {
    title: { en: overrides.en },
    altTitles: [],
    links: overrides.al ? { al: overrides.al } : null,
  },
});

describe("pickBestMatch", () => {
  it("prefers an exact-title match over a colored-edition with the AniList link", () => {
    const main = make({
      id: "main",
      en: "Demon Slayer: Kimetsu no Yaiba",
    });
    const colored = make({
      id: "colored",
      en: "Demon Slayer: Kimetsu no Yaiba (Official Colored)",
      al: "87216",
    });

    const winner = pickBestMatch(
      [main, colored],
      87216,
      "Demon Slayer: Kimetsu no Yaiba",
    );

    expect(winner?.id).toBe("main");
  });

  it("uses the AniList link match when no plain-titled candidate exists", () => {
    const colored = make({
      id: "colored",
      en: "Hypothetical Series (Full Color)",
      al: "99999",
    });
    const other = make({ id: "other", en: "Unrelated Series" });

    const winner = pickBestMatch(
      [other, colored],
      99999,
      "Hypothetical Series",
    );

    expect(winner?.id).toBe("colored");
  });

  it("keeps preferring the marked candidate when the preferred title itself carries the marker", () => {
    const plain = make({ id: "plain", en: "Foo Bar" });
    const colored = make({
      id: "colored",
      en: "Foo Bar (Official Colored)",
      al: "42",
    });

    const winner = pickBestMatch(
      [plain, colored],
      42,
      "Foo Bar (Official Colored)",
    );

    expect(winner?.id).toBe("colored");
  });

  it("returns null when nothing matches by title or AniList id", () => {
    const a = make({ id: "a", en: "Totally Different" });
    const b = make({ id: "b", en: "Also Different", al: "1" });

    const winner = pickBestMatch([a, b], 999, "Searched Title");

    expect(winner).toBeNull();
  });

  it("prefers AniList-link match over a non-matching plain candidate when titles are unrelated", () => {
    const wrongTitle = make({
      id: "wrong",
      en: "Shingeki no Kyojin",
      al: "53390",
    });
    const distractor = make({ id: "distract", en: "Some Other Manga" });

    const winner = pickBestMatch(
      [distractor, wrongTitle],
      53390,
      "Attack on Titan",
    );

    expect(winner?.id).toBe("wrong");
  });
});

describe("isMangaRecord", () => {
  it("accepts a manga record with string title maps", () => {
    expect(isMangaRecord(make({ id: "a", en: "Title", al: "1" }))).toBe(true);
  });

  it("rejects a record whose title map holds a non-string", () => {
    expect(
      isMangaRecord({
        id: "a",
        attributes: { title: { en: 3 }, altTitles: [], links: null },
      }),
    ).toBe(false);
  });

  it("rejects a record missing its attributes", () => {
    expect(isMangaRecord({ id: "a" })).toBe(false);
    expect(isMangaRecord(null)).toBe(false);
  });
});

describe("isCoverRecord", () => {
  it("accepts a cover with nullable volume and locale", () => {
    expect(
      isCoverRecord({
        id: "c",
        attributes: { volume: null, locale: null, fileName: "x.jpg" },
      }),
    ).toBe(true);
  });

  it("rejects a cover with no file name", () => {
    expect(
      isCoverRecord({ id: "c", attributes: { volume: "1", locale: "ja" } }),
    ).toBe(false);
  });
});

describe("hasVolume", () => {
  const cover = (volume: string | null) => ({
    id: "c",
    attributes: { volume, locale: "ja", fileName: "x.jpg" },
  });

  it("keeps a cover tied to a volume", () => {
    expect(hasVolume(cover("3"))).toBe(true);
  });

  it("drops a cover with no volume number", () => {
    expect(hasVolume(cover(null))).toBe(false);
    expect(hasVolume(cover(""))).toBe(false);
  });
});

describe("preferredTitle", () => {
  it("prefers English, then romaji, then Japanese", () => {
    expect(
      preferredTitle([
        { locale: "ja", value: "進撃の巨人" },
        { locale: "ja-ro", value: "Shingeki no Kyojin" },
        { locale: "en", value: "Attack on Titan" },
      ]),
    ).toBe("Attack on Titan");
    expect(
      preferredTitle([
        { locale: "ja", value: "進撃の巨人" },
        { locale: "ja-ro", value: "Shingeki no Kyojin" },
      ]),
    ).toBe("Shingeki no Kyojin");
  });

  it("falls back to the first title, then to null", () => {
    expect(preferredTitle([{ locale: "ko", value: "진격의 거인" }])).toBe(
      "진격의 거인",
    );
    expect(preferredTitle([])).toBeNull();
  });
});

describe("countAggregate", () => {
  it("counts numbered volumes and every chapter", () => {
    expect(
      countAggregate({
        volumes: {
          "1": { chapters: { "1": {}, "2": {} } },
          "2": { chapters: { "3": {} } },
          none: { chapters: { "4": {} } },
        },
      }),
    ).toEqual({ volumeCount: 2, chapterCount: 4 });
  });

  it("reads an empty aggregate, which MangaDex sends as an array", () => {
    expect(countAggregate({ volumes: [] })).toEqual({
      volumeCount: 0,
      chapterCount: 0,
    });
    expect(countAggregate(null)).toEqual({ volumeCount: 0, chapterCount: 0 });
  });
});
