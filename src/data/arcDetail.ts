import { isAdapted } from "@/data/mapping";
import type { MappingEntry } from "@/types";

// Per-episode and per-chapter rows for one arc's detail screen. The catalog
// only records where an arc starts and ends on each side, so rows inside an
// arc are spread linearly between those bounds.

export type EpisodeRow = {
  episode: number;
  chapterStart: number;
  chapterEnd: number;
};

export type ChapterRow = {
  chapter: number;
  /** Null when the anime has not reached this arc. */
  episode: number | null;
};

/** Each episode of an adapted arc with the chapters it roughly covers. */
export function expandEpisodes(arc: MappingEntry): EpisodeRow[] {
  if (!isAdapted(arc)) return [];
  const [e1, e2] = arc.episodes;
  const [c1, c2] = arc.chapters;
  const epCount = e2 - e1 + 1;
  const chPerEp = (c2 - c1 + 1) / epCount;

  return Array.from({ length: epCount }, (_, i) => {
    const chapterEnd =
      c1 + Math.max(Math.ceil((i + 1) * chPerEp) - 1, Math.floor(i * chPerEp));
    return {
      episode: e1 + i,
      chapterStart: c1 + Math.floor(i * chPerEp),
      chapterEnd: Math.min(chapterEnd, c2),
    };
  });
}

/** Each chapter of an arc with the episode that roughly adapts it. */
export function expandChapters(arc: MappingEntry): ChapterRow[] {
  const [c1, c2] = arc.chapters;
  const chCount = c2 - c1 + 1;
  if (!isAdapted(arc)) {
    return Array.from({ length: chCount }, (_, i) => ({
      chapter: c1 + i,
      episode: null,
    }));
  }

  const [e1, e2] = arc.episodes;
  const epCount = e2 - e1 + 1;
  const epPerCh = epCount / chCount;
  return Array.from({ length: chCount }, (_, i) => ({
    chapter: c1 + i,
    episode: e1 + Math.min(Math.floor(i * epPerCh), epCount - 1),
  }));
}
