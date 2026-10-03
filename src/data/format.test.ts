import { describe, expect, it } from "bun:test";
import {
  displayTitle,
  englishTitle,
  formatAniListDate,
  formatAniListDateJa,
  localeLabel,
} from "./format";

describe("formatAniListDate", () => {
  it("returns empty string for missing year", () => {
    expect(formatAniListDate(null)).toBe("");
    expect(formatAniListDate(undefined)).toBe("");
    expect(formatAniListDate({ year: null, month: 3, day: 12 })).toBe("");
  });

  it("formats full date", () => {
    expect(formatAniListDate({ year: 2024, month: 3, day: 12 })).toBe(
      "Mar 12, 2024",
    );
  });

  it("formats year + month only", () => {
    expect(formatAniListDate({ year: 2024, month: 7, day: null })).toBe(
      "Jul 2024",
    );
  });

  it("formats year only", () => {
    expect(formatAniListDate({ year: 2024, month: null, day: null })).toBe(
      "2024",
    );
  });
});

describe("formatAniListDateJa", () => {
  it("formats full date in Japanese", () => {
    expect(formatAniListDateJa({ year: 2024, month: 3, day: 12 })).toBe(
      "2024年3月12日",
    );
  });

  it("formats year + month in Japanese", () => {
    expect(formatAniListDateJa({ year: 2024, month: 7, day: null })).toBe(
      "2024年7月",
    );
  });

  it("formats year only in Japanese", () => {
    expect(formatAniListDateJa({ year: 2024, month: null, day: null })).toBe(
      "2024年",
    );
  });
});

describe("localeLabel", () => {
  it("maps known locales to friendly names", () => {
    expect(localeLabel("en")).toBe("English");
    expect(localeLabel("ja-ro")).toBe("Japanese (romaji)");
  });

  it("is case-insensitive on lookup", () => {
    expect(localeLabel("EN")).toBe("English");
  });

  it("falls back to uppercase for unknown locales", () => {
    expect(localeLabel("xx")).toBe("XX");
  });
});

describe("englishTitle", () => {
  it("prefers the English title", () => {
    expect(
      englishTitle({
        romaji: "Shingeki no Kyojin",
        english: "Attack on Titan",
      }),
    ).toBe("Attack on Titan");
  });

  it("falls back to romaji when AniList has no English title", () => {
    expect(englishTitle({ romaji: "Mushishi", english: null })).toBe(
      "Mushishi",
    );
  });
});

describe("displayTitle", () => {
  const title = {
    romaji: "Shingeki no Kyojin",
    english: "Attack on Titan",
    native: "進撃の巨人",
  };

  it("shows the English title by default", () => {
    expect(displayTitle({ title, japanese: false })).toBe("Attack on Titan");
  });

  it("shows the native title in Japanese mode", () => {
    expect(displayTitle({ title, japanese: true })).toBe("進撃の巨人");
  });

  it("falls back to the English title in Japanese mode with no native title", () => {
    expect(
      displayTitle({ title: { ...title, native: null }, japanese: true }),
    ).toBe("Attack on Titan");
  });
});
