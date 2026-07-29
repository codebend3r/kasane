import type { SeriesMapping } from "@/types";

export type MappedShowSortField = "alpha" | "episodes" | "chapters";
export type SortDirection = "asc" | "desc";
export type MappedShowSort = {
  field: MappedShowSortField;
  direction: SortDirection;
};

export type MappedShow = {
  // Stable list key. Several series legitimately share a manga id (a shared
  // source adapted more than once), so `routeId` alone duplicates.
  key: string;
  routeId: number;
  // Cover art is fetched from AniList against the anime id, so carry it here
  // rather than re-deriving it from the mapping at render time.
  coverId: number;
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
  key: `${m.anilistAnimeId}-${m.anilistMangaId}`,
  // Matches the series screen, which keys progress on the manga id.
  routeId: m.anilistMangaId,
  coverId: m.anilistAnimeId,
  title: m.title,
  episodes: m.mappings.reduce(
    (acc, a) => (a.episodes ? Math.max(acc, a.episodes[1]) : acc),
    0,
  ),
  chapters: m.mappings.reduce((acc, a) => Math.max(acc, a.chapters[1]), 0),
  arcs: m.mappings.length,
});

// Titles read best A–Z; counts read best biggest-first, so each column opens
// the way you'd expect and only flips once you ask it to.
const DEFAULT_DIRECTION: Record<MappedShowSortField, SortDirection> = {
  alpha: "asc",
  episodes: "desc",
  chapters: "desc",
};

export const DEFAULT_SORT: MappedShowSort = {
  field: "alpha",
  direction: "asc",
};

/** Table-header behaviour: same column flips direction, a new one resets it. */
export const nextSort = (
  current: MappedShowSort,
  field: MappedShowSortField,
): MappedShowSort =>
  current.field === field
    ? { field, direction: current.direction === "asc" ? "desc" : "asc" }
    : { field, direction: DEFAULT_DIRECTION[field] };

const byTitle = (a: MappedShow, b: MappedShow): number =>
  a.title.localeCompare(b.title);

const byField = (
  a: MappedShow,
  b: MappedShow,
  field: MappedShowSortField,
): number =>
  field === "alpha"
    ? byTitle(a, b)
    : field === "episodes"
      ? a.episodes - b.episodes
      : a.chapters - b.chapters;

export const sortMappedShows = (
  shows: readonly MappedShow[],
  { field, direction }: MappedShowSort,
): MappedShow[] => {
  const sign = direction === "asc" ? 1 : -1;
  // The title tie-break stays ascending in both directions so a descending
  // count column doesn't also reverse the names inside each tied group.
  return [...shows].sort(
    (a, b) => sign * byField(a, b, field) || byTitle(a, b),
  );
};
