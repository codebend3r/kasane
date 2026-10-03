import type { MappingEntry, SeriesMapping } from "@/types";

// Arc lookups over a `SeriesMapping`, curated or synthetic. Every function here
// reads the arcs in catalog order, so when two arcs overlap the first one wins.

/** An arc the anime has reached: it carries an episode range. */
export type AdaptedArc = MappingEntry & { episodes: [number, number] };

export function isAdapted(arc: MappingEntry): arc is AdaptedArc {
  return !!arc.episodes;
}

const within = (value: number, [from, to]: [number, number]): boolean =>
  value >= from && value <= to;

/** The first adapted arc whose episode range holds `episode`. */
export function arcForEpisode(
  mapping: SeriesMapping,
  episode: number,
): AdaptedArc | null {
  return (
    mapping.mappings
      .filter(isAdapted)
      .find((arc) => within(episode, arc.episodes)) ?? null
  );
}

/** The first arc, adapted or not, whose chapter range holds `chapter`. */
export function arcForChapter(
  mapping: SeriesMapping,
  chapter: number,
): MappingEntry | null {
  return mapping.mappings.find((arc) => within(chapter, arc.chapters)) ?? null;
}

export function episodeToChapters(
  mapping: SeriesMapping,
  episode: number,
): [number, number] | null {
  return arcForEpisode(mapping, episode)?.chapters ?? null;
}

export function chapterToEpisodes(
  mapping: SeriesMapping,
  chapter: number,
): [number, number] | null {
  return arcForChapter(mapping, chapter)?.episodes ?? null;
}

/** The highest episode any arc reaches, or null when nothing is adapted yet. */
export function lastMappedEpisode(mapping: SeriesMapping): number | null {
  return mapping.mappings
    .filter(isAdapted)
    .reduce<number | null>(
      (max, arc) => Math.max(max ?? 0, arc.episodes[1]),
      null,
    );
}

/** The highest chapter any arc reaches. */
export function lastMappedChapter(mapping: SeriesMapping): number {
  return mapping.mappings.reduce(
    (max, arc) => Math.max(max, arc.chapters[1]),
    0,
  );
}
