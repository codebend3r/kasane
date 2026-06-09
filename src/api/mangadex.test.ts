import { pickBestMatch } from "./mangadex";

type Record = Parameters<typeof pickBestMatch>[0][number];

const make = (overrides: { id: string; en: string; al?: string }): Record => ({
  id: overrides.id,
  attributes: {
    title: { en: overrides.en },
    altTitles: [],
    links: overrides.al ? { al: overrides.al } : null,
    lastVolume: null,
    lastChapter: null,
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
