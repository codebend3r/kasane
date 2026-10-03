import type { GenreFilter } from "@/data/genreFilters";
import type { MappingEntry, MovieEntry, SeriesMapping } from "@/types";
import type { ArcRow, MovieRow, SeriesRow } from "@/types/catalog";
import type { Database } from "@/types/supabase";

type AliasRow = Pick<
  Database["public"]["Tables"]["search_aliases"]["Row"],
  "alias" | "target"
>;
type GenreRow = Database["public"]["Tables"]["genre_filters"]["Row"];

export type Catalog = {
  mappings: SeriesMapping[];
  aliases: Record<string, string>;
  genreFilters: GenreFilter[];
};

const byPosition = <T extends { position: number }>(rows: readonly T[]): T[] =>
  [...rows].sort((a, b) => a.position - b.position);

const toArc = (a: ArcRow): MappingEntry => ({
  chapters: [a.chapter_start, a.chapter_end],
  episodes:
    a.episode_start !== null && a.episode_end !== null
      ? [a.episode_start, a.episode_end]
      : undefined,
  arc: a.arc ?? undefined,
  season: a.season ?? undefined,
  note: a.note ?? undefined,
});

const toMovie = (m: MovieRow): MovieEntry => ({
  anilistId: m.anilist_id ?? undefined,
  title: m.title,
  year: m.year,
  chapters:
    m.chapter_start !== null && m.chapter_end !== null
      ? [m.chapter_start, m.chapter_end]
      : undefined,
  afterEpisode: m.after_episode ?? undefined,
  note: m.note ?? undefined,
});

/** A `series` row with its embedded arcs and films, as the app models it. */
export const rowToMapping = (row: SeriesRow): SeriesMapping => {
  const movies = byPosition(row.movies).map(toMovie);
  return {
    anilistAnimeId: row.anilist_anime_id,
    anilistMangaId: row.anilist_manga_id,
    title: row.title,
    sourceNotes: row.source_notes ?? undefined,
    mappings: byPosition(row.arc_mappings).map(toArc),
    movies: movies.length > 0 ? movies : undefined,
  };
};

export const toAliasTable = (
  rows: readonly AliasRow[],
): Record<string, string> =>
  Object.fromEntries(rows.map((a) => [a.alias, a.target]));

/** Unknown kinds from the database degrade to "genre" rather than failing. */
export const toGenreFilter = (g: GenreRow): GenreFilter => ({
  id: g.id,
  label: g.label,
  kind: g.kind === "tag" ? "tag" : "genre",
  token: g.token,
});

/**
 * Media-id -> series index. Both the anime and the manga id resolve to the
 * series; when two series share an id the first-listed wins, and series arrive
 * ordered by id, so the older catalog entry keeps the lookup.
 */
export const indexByMediaId = (
  mappings: readonly SeriesMapping[],
): Map<number, SeriesMapping> =>
  mappings.reduce((acc, m) => {
    if (!acc.has(m.anilistAnimeId)) acc.set(m.anilistAnimeId, m);
    if (!acc.has(m.anilistMangaId)) acc.set(m.anilistMangaId, m);
    return acc;
  }, new Map<number, SeriesMapping>());
