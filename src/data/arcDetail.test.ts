import { describe, expect, it } from "bun:test";
import { expandChapters, expandEpisodes } from "./arcDetail";
import type { MappingEntry } from "@/types";

describe("expandEpisodes", () => {
  it("spreads an arc's chapters across its episodes", () => {
    const arc: MappingEntry = { episodes: [1, 3], chapters: [1, 6] };
    expect(expandEpisodes(arc)).toEqual([
      { episode: 1, chapterStart: 1, chapterEnd: 2 },
      { episode: 2, chapterStart: 3, chapterEnd: 4 },
      { episode: 3, chapterStart: 5, chapterEnd: 6 },
    ]);
  });

  it("gives every episode at least one chapter when episodes outnumber them", () => {
    const arc: MappingEntry = { episodes: [10, 13], chapters: [20, 21] };
    expect(expandEpisodes(arc)).toEqual([
      { episode: 10, chapterStart: 20, chapterEnd: 20 },
      { episode: 11, chapterStart: 20, chapterEnd: 20 },
      { episode: 12, chapterStart: 21, chapterEnd: 21 },
      { episode: 13, chapterStart: 21, chapterEnd: 21 },
    ]);
  });

  it("is empty for an arc the anime has not reached", () => {
    expect(expandEpisodes({ chapters: [1, 10] })).toEqual([]);
  });
});

describe("expandChapters", () => {
  it("assigns each chapter the episode that roughly adapts it", () => {
    const arc: MappingEntry = { episodes: [5, 6], chapters: [11, 14] };
    expect(expandChapters(arc)).toEqual([
      { chapter: 11, episode: 5 },
      { chapter: 12, episode: 5 },
      { chapter: 13, episode: 6 },
      { chapter: 14, episode: 6 },
    ]);
  });

  it("lists an unadapted arc's chapters with no episode", () => {
    expect(expandChapters({ chapters: [7, 8] })).toEqual([
      { chapter: 7, episode: null },
      { chapter: 8, episode: null },
    ]);
  });
});
