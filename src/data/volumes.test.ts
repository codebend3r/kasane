import { describe, expect, it } from "bun:test";
import { groupCovers } from "./volumes";
import type { MangaDexVolumeCover } from "@/types";

const cover = (volume: string, locale: string): MangaDexVolumeCover => ({
  volume,
  locale,
  url: `https://covers/${volume}-${locale}.512.jpg`,
  thumbUrl: `https://covers/${volume}-${locale}.256.jpg`,
});

describe("groupCovers", () => {
  const covers = [
    cover("2", "ja"),
    cover("1", "ja"),
    cover("1", "en"),
    cover("1.5", "en"),
    cover("extra", "en"),
  ];

  it("groups by whole volume number in ascending order", () => {
    expect(
      groupCovers({ covers, japanese: false }).map((g) => g.volume),
    ).toEqual([1, 2]);
  });

  it("leads with the whole volume in the reader's language", () => {
    const [first] = groupCovers({ covers, japanese: false });
    expect(first.primary).toEqual(cover("1", "en"));
    expect(first.variants).toEqual([cover("1", "ja"), cover("1.5", "en")]);
  });

  it("prefers the Japanese edition in Japanese mode", () => {
    const [first] = groupCovers({ covers, japanese: true });
    expect(first.primary).toEqual(cover("1", "ja"));
  });

  it("drops covers whose volume is not a number", () => {
    const all = groupCovers({ covers, japanese: false }).flatMap((g) => [
      g.primary,
      ...g.variants,
    ]);
    expect(all.some((c) => c.volume === "extra")).toBe(false);
  });
});
