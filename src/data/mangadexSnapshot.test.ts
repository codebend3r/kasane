import { describe, expect, it } from "bun:test";
import {
  coverUrl,
  isMangaDexCoverFile,
  isMangaDexTitle,
  rowToSnapshot,
  snapshotToInfo,
  type MangaDexSeriesRow,
  type MangaDexSnapshot,
} from "./mangadexSnapshot";

const snapshot: MangaDexSnapshot = {
  mangadexId: "m1",
  titles: [{ locale: "en", value: "Naruto" }],
  volumes: 2,
  chapters: 9,
  covers: [
    { volume: "1", locale: "ja", fileName: "a.png" },
    { volume: "2", locale: "en", fileName: "b.jpg" },
  ],
};

// Stray and malformed entries sit among the good ones on purpose.
const row: MangaDexSeriesRow = {
  id: 7,
  anilist_manga_id: 30011,
  mangadex_id: "m1",
  titles: [
    { locale: "en", value: "Naruto" },
    { locale: "ja", value: 3 },
    "stray",
  ],
  covers: [
    { volume: "1", locale: "ja", fileName: "a.png" },
    { volume: 2, locale: "en", fileName: "x.jpg" },
    { volume: "2", locale: "en", fileName: "b.jpg" },
  ],
  volumes: 2,
  chapters: 9,
  fetched_at: "2026-11-08T00:00:00Z",
  created_at: "2026-11-08T00:00:00Z",
  updated_at: "2026-11-08T00:00:00Z",
};

describe("isMangaDexTitle", () => {
  it("accepts a locale and value pair of strings", () => {
    expect(isMangaDexTitle({ locale: "en", value: "Naruto" })).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isMangaDexTitle({ locale: "en", value: 3 })).toBe(false);
    expect(isMangaDexTitle({ locale: "en" })).toBe(false);
    expect(isMangaDexTitle("Naruto")).toBe(false);
    expect(isMangaDexTitle(null)).toBe(false);
    expect(isMangaDexTitle([])).toBe(false);
  });
});

describe("isMangaDexCoverFile", () => {
  it("accepts a volume, locale and file name of strings", () => {
    expect(
      isMangaDexCoverFile({ volume: "1", locale: "ja", fileName: "a.png" }),
    ).toBe(true);
  });

  it("rejects a missing or non-string field", () => {
    expect(
      isMangaDexCoverFile({ volume: 1, locale: "ja", fileName: "a.png" }),
    ).toBe(false);
    expect(isMangaDexCoverFile({ volume: "1", locale: "ja" })).toBe(false);
    expect(isMangaDexCoverFile(null)).toBe(false);
  });
});

describe("coverUrl", () => {
  const cover = { base: "/_mdx-covers", mangaId: "m1", fileName: "a.png" };

  it("asks for MangaDex's resized JPEG for a thumbnail size", () => {
    expect(coverUrl({ ...cover, size: "256" })).toBe(
      "/_mdx-covers/m1/a.png.256.jpg",
    );
    expect(coverUrl({ ...cover, size: "512" })).toBe(
      "/_mdx-covers/m1/a.png.512.jpg",
    );
  });

  it("leaves the original file name alone at full size", () => {
    expect(coverUrl({ ...cover, size: "full" })).toBe("/_mdx-covers/m1/a.png");
  });
});

describe("rowToSnapshot", () => {
  it("lifts a cached row into a snapshot, keeping only well-formed entries", () => {
    expect(rowToSnapshot(row)).toEqual(snapshot);
  });

  it("reads a non-array column as empty", () => {
    expect(
      rowToSnapshot({ ...row, titles: { en: "Naruto" }, covers: null }),
    ).toEqual({ ...snapshot, titles: [], covers: [] });
  });
});

describe("snapshotToInfo", () => {
  it("resolves every cover to a 512 image and a 256 thumbnail under the base", () => {
    expect(snapshotToInfo({ snapshot, coversBase: "/_mdx-covers" })).toEqual({
      titles: [{ locale: "en", value: "Naruto" }],
      volumes: 2,
      chapters: 9,
      covers: [
        {
          volume: "1",
          locale: "ja",
          url: "/_mdx-covers/m1/a.png.512.jpg",
          thumbUrl: "/_mdx-covers/m1/a.png.256.jpg",
        },
        {
          volume: "2",
          locale: "en",
          url: "/_mdx-covers/m1/b.jpg.512.jpg",
          thumbUrl: "/_mdx-covers/m1/b.jpg.256.jpg",
        },
      ],
    });
  });
});
