import type { SeriesMapping } from "@/types";

export type MappedShowSort = "alpha" | "episodes";

export type MappedShow = {
  routeId: number;
  title: string;
  episodes: number;
  chapters: number;
  arcs: number;
};

/**
 * Flattens a catalog mapping into the counts the menu lists. Totals come from
 * the arc bands themselves, so this needs no AniList round trip and works
 * offline from the persisted catalog.
 */
export const toMappedShow = (m: SeriesMapping): MappedShow => ({
  // Matches the series screen, which keys progress on the manga id.
  routeId: m.anilistMangaId,
  title: m.title,
  episodes: m.mappings.reduce(
    (acc, a) => (a.episodes ? Math.max(acc, a.episodes[1]) : acc),
    0,
  ),
  chapters: m.mappings.reduce((acc, a) => Math.max(acc, a.chapters[1]), 0),
  arcs: m.mappings.length,
});

const byTitle = (a: MappedShow, b: MappedShow): number =>
  a.title.localeCompare(b.title);

export const sortMappedShows = (
  shows: readonly MappedShow[],
  sort: MappedShowSort,
): MappedShow[] =>
  sort === "alpha"
    ? [...shows].sort(byTitle)
    : // Most episodes first; ties fall back to alphabetical so the order is
      // stable rather than dependent on catalog insertion order.
      [...shows].sort((a, b) => b.episodes - a.episodes || byTitle(a, b));
