import { describe, expect, it } from "bun:test";
import {
  buildArcLayout,
  describeChapters,
  describeCoverage,
  describeEpisodes,
  fractionAt,
  segmentAt,
  segmentLabel,
  type ArcAxis,
} from "./arcLayout";
import type { SeriesMapping } from "@/types";

const series = (mappings: SeriesMapping["mappings"]): SeriesMapping => ({
  anilistAnimeId: 1,
  anilistMangaId: 2,
  title: "Test",
  mappings,
});

const tiled = series([
  { episodes: [1, 12], chapters: [1, 40], arc: "First" },
  { episodes: [13, 24], chapters: [41, 80], arc: "Second" },
]);

// Chapters 51-100 belong to no arc, and episodes 11-20 are filler.
const gapped = series([
  { episodes: [1, 10], chapters: [1, 50], arc: "Opening" },
  { episodes: [21, 30], chapters: [101, 150], arc: "Middle" },
  { episodes: [31, 40], chapters: [151, 200] },
]);

describe("buildArcLayout", () => {
  it("lays segments end to end by span", () => {
    const { manga } = buildArcLayout({ mapping: tiled, totalChapters: null });
    expect(manga).toEqual({
      total: 80,
      segments: [
        {
          arcIndex: 0,
          name: "First",
          from: 1,
          to: 40,
          span: 40,
          offset: 0,
          adapted: true,
        },
        {
          arcIndex: 1,
          name: "Second",
          from: 41,
          to: 80,
          span: 40,
          offset: 40,
          adapted: true,
        },
      ],
    });
  });

  it("leaves unadapted arcs off the episode axis but keeps them on the chapter axis", () => {
    const layout = buildArcLayout({
      mapping: series([
        { episodes: [1, 12], chapters: [1, 40], arc: "Aired" },
        { chapters: [41, 80], arc: "Not yet" },
      ]),
      totalChapters: 120,
    });
    expect(layout.anime.segments.map((s) => s.name)).toEqual(["Aired"]);
    expect(layout.manga.segments.map((s) => [s.name, s.adapted])).toEqual([
      ["Aired", true],
      ["Not yet", false],
    ]);
  });

  it("adds a grey tail for published chapters once every arc is adapted", () => {
    const { manga } = buildArcLayout({ mapping: tiled, totalChapters: 100 });
    expect(manga.total).toBe(100);
    expect(manga.segments.at(-1)).toEqual({
      arcIndex: null,
      name: null,
      from: 81,
      to: 100,
      span: 20,
      offset: 80,
      adapted: false,
    });
  });

  it("draws no tail while an arc is still unadapted", () => {
    const { manga } = buildArcLayout({
      mapping: series([
        { episodes: [1, 12], chapters: [1, 40] },
        { chapters: [41, 80] },
      ]),
      totalChapters: 200,
    });
    expect(manga.segments.every((s) => s.arcIndex !== null)).toBe(true);
  });

  it("draws no tail when the manga ends where the arcs do", () => {
    const { manga } = buildArcLayout({ mapping: tiled, totalChapters: 80 });
    expect(manga.segments).toHaveLength(2);
  });

  it("measures the adapted share over mapped chapters, ignoring the tail", () => {
    const layout = buildArcLayout({
      mapping: series([
        { episodes: [1, 12], chapters: [1, 30] },
        { chapters: [31, 100] },
      ]),
      totalChapters: null,
    });
    expect(layout.percentAdapted).toBe(30);
    expect(
      buildArcLayout({ mapping: tiled, totalChapters: 400 }).percentAdapted,
    ).toBe(100);
  });
});

describe("fractionAt", () => {
  const { anime, manga } = buildArcLayout({
    mapping: gapped,
    totalChapters: null,
  });

  it("lands the end of each arc exactly where its bar ends", () => {
    // Dividing by the last chapter would put the middle arc's end at 75%,
    // past its bar; walking the segments puts it at the bar's edge.
    expect(fractionAt(manga, 50)).toBeCloseTo(1 / 3);
    expect(fractionAt(manga, 150)).toBeCloseTo(2 / 3);
    expect(fractionAt(manga, 200)).toBe(1);
  });

  it("parks a position in a gap at the end of the segment before it", () => {
    expect(fractionAt(manga, 75)).toBeCloseTo(1 / 3);
    expect(fractionAt(anime, 15)).toBeCloseTo(1 / 3);
  });

  it("clamps below the first segment and past the last", () => {
    expect(fractionAt(manga, 0)).toBe(0);
    expect(fractionAt(manga, 999)).toBe(1);
  });

  it("is zero on an empty axis", () => {
    const empty: ArcAxis = { segments: [], total: 0 };
    expect(fractionAt(empty, 10)).toBe(0);
  });
});

describe("segmentAt", () => {
  const { manga } = buildArcLayout({ mapping: gapped, totalChapters: null });

  it("finds the segment drawn at a fraction of the axis", () => {
    expect(segmentAt(manga, 0)?.name).toBe("Opening");
    expect(segmentAt(manga, 0.5)?.name).toBe("Middle");
    expect(segmentAt(manga, 0.99)?.from).toBe(151);
  });

  it("is null past the end of the axis", () => {
    expect(segmentAt(manga, 1)).toBeNull();
  });
});

describe("segmentLabel", () => {
  it("is the arc name, or its range when the arc is unnamed", () => {
    const { manga } = buildArcLayout({ mapping: gapped, totalChapters: null });
    expect(manga.segments.map(segmentLabel)).toEqual([
      "Opening",
      "Middle",
      "151–200",
    ]);
  });
});

describe("screen reader summaries", () => {
  const layout = buildArcLayout({
    mapping: series([
      { episodes: [1, 12], chapters: [1, 40], arc: "Aired" },
      { chapters: [41, 80] },
    ]),
    totalChapters: null,
  });

  it("lists each adapted arc's episodes", () => {
    expect(describeEpisodes(layout)).toBe(
      "Anime episodes by arc. Aired, episodes 1 to 12",
    );
  });

  it("lists each arc's chapters and flags the unadapted ones", () => {
    expect(describeChapters(layout)).toBe(
      "Manga chapters by arc. Aired, chapters 1 to 40. 41 to 80, chapters 41 to 80, not yet adapted",
    );
  });

  it("leads the coverage summary with the adapted share", () => {
    expect(describeCoverage(layout)).toBe(
      "Arc coverage. 50% of the mapped chapters are adapted. Aired, up to chapter 40. 41–80, up to chapter 80",
    );
  });
});
