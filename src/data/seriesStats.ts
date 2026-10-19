import { formatAniListDate } from "@/data/format";
import { lastMappedEpisode } from "@/data/mapping";
import type { SeriesEntry, SeriesMapping } from "@/types";

// The one-line summaries a series shows under its title. The series screen
// and the search card say different things, but both count episodes the same
// way: as far as the mapping reaches, else AniList's own count.

/** Episodes a series has: as far as its mapping reaches, else AniList's count. */
export function episodeTotal({
  entry,
  mapping,
}: {
  entry: SeriesEntry;
  mapping: SeriesMapping | null;
}): number | null {
  return (
    (mapping ? lastMappedEpisode(mapping) : null) ??
    entry.anime?.episodes ??
    null
  );
}

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

/**
 * The series screen's metadata line: chapter and volume counts on the manga
 * side, episode and movie counts on the anime side, the format, then the start
 * date or, without one, the status. Unknown counts show as "?".
 */
export function detailStats({
  entry,
  mapping,
  chapters,
  volumes,
}: {
  entry: SeriesEntry;
  mapping: SeriesMapping | null;
  chapters: number | null;
  volumes: number | null;
}): string[] {
  const { primary, badge } = entry;
  const movies = mapping?.movies.length ?? 0;
  const status = primary.status?.toLowerCase() ?? null;
  const dated = primary.startDate.year
    ? [formatAniListDate(primary.startDate)]
    : [];
  return [
    ...(badge !== "anime-only"
      ? [`${chapters ?? "?"} ch`, `${volumes ?? "?"} vol`]
      : []),
    ...(badge !== "manga-only"
      ? [
          `${episodeTotal({ entry, mapping }) ?? "?"} eps`,
          ...(movies > 0 ? [plural(movies, "movie", "movies")] : []),
        ]
      : []),
    ...(primary.format ? [primary.format] : []),
    ...(dated.length > 0 ? dated : status ? [status] : []),
  ];
}

/**
 * A search card's line: episodes and chapters, "ongoing" where AniList has no
 * count yet, then the start year.
 */
export function cardStats({
  entry,
  mapping,
}: {
  entry: SeriesEntry;
  mapping: SeriesMapping | null;
}): string[] {
  const { anime, manga, badge, primary } = entry;
  const episodes = episodeTotal({ entry, mapping });
  const chapters = manga?.chapters ?? null;
  return [
    ...(anime || badge === "anime-only"
      ? [episodes ? `${episodes} eps` : "Anime ongoing"]
      : []),
    ...(manga || badge === "manga-only"
      ? [chapters ? `${chapters} ch` : "Manga ongoing"]
      : []),
    ...(primary.startDate.year ? [String(primary.startDate.year)] : []),
  ];
}
