import type { AniListMedia, SeriesMapping } from "@/types";

// AniList ranks a search by text match alone and returns one page, so a short
// query like "attack" can push a curated series (Attack on Titan sits at #21)
// off the page entirely, and "Mapped only" then hides everything that is left.
// Matching the catalog's own titles locally guarantees every mapped series the
// query names is fetched and shown first.

/** How many catalog matches to fetch alongside the AniList page. */
export const CATALOG_MATCH_LIMIT = 10;

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// 0: the title starts with the query, 1: a word does, 2: it appears anywhere.
const matchRank = ({
  title,
  query,
}: {
  title: string;
  query: string;
}): number | null => {
  if (title.startsWith(query)) return 0;
  if (` ${title}`.includes(` ${query}`)) return 1;
  return title.includes(query) ? 2 : null;
};

/**
 * The catalog series whose title contains `query`, best match first: titles
 * that start with it, then titles with a word that starts with it, then any
 * other substring match, each group in catalog order.
 */
export function matchCatalogTitles({
  query,
  mappings,
  limit = CATALOG_MATCH_LIMIT,
}: {
  query: string;
  mappings: readonly SeriesMapping[];
  limit?: number;
}): SeriesMapping[] {
  const needle = normalize(query);
  if (needle.length < 2) return [];
  return mappings
    .map((mapping, index) => ({
      mapping,
      index,
      rank: matchRank({ title: normalize(mapping.title), query: needle }),
    }))
    .filter(
      (m): m is { mapping: SeriesMapping; index: number; rank: number } =>
        m.rank !== null,
    )
    .toSorted((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map((m) => m.mapping);
}

/** Both AniList ids of every matched series, anime first, without repeats. */
export function catalogMediaIds(matches: readonly SeriesMapping[]): number[] {
  return [
    ...new Set(matches.flatMap((m) => [m.anilistAnimeId, m.anilistMangaId])),
  ];
}

/**
 * The catalog's media ahead of AniList's page, each id once. Catalog media
 * keep the order of `ids`, so the best title match leads.
 */
export function mergeSearchResults({
  ids,
  catalogMedia,
  searchMedia,
}: {
  ids: readonly number[];
  catalogMedia: readonly AniListMedia[];
  searchMedia: readonly AniListMedia[];
}): AniListMedia[] {
  const byId = new Map(
    catalogMedia.map((m): [number, AniListMedia] => [m.id, m]),
  );
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((m): m is AniListMedia => !!m);
  const seen = new Set(ordered.map((m) => m.id));
  return [...ordered, ...searchMedia.filter((m) => !seen.has(m.id))];
}
