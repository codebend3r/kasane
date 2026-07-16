import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { setSearchAliases } from "@/data/searchAliases";
import type { GenreFilter } from "@/data/genreFilters";
import type { MappingEntry, MovieEntry, SeriesMapping } from "@/types";
import type { Database } from "@/types/supabase";

type ArcRow = Database["public"]["Tables"]["arc_mappings"]["Row"];
type MovieRow = Database["public"]["Tables"]["movies"]["Row"];
type SeriesRow = Database["public"]["Tables"]["series"]["Row"] & {
  arc_mappings: ArcRow[];
  movies: MovieRow[];
};

export type Catalog = {
  mappings: SeriesMapping[];
  byMediaId: Map<number, SeriesMapping>;
  aliases: Record<string, string>;
  genreFilters: GenreFilter[];
};

export const CATALOG_QUERY_KEY = ["catalog"] as const;

// Refetch at most hourly; keep the persisted copy for a week so a cold launch
// renders instantly (and offline) from cache while a background refresh runs.
const CATALOG_STALE_MS = 60 * 60 * 1000;
const CATALOG_GC_MS = 7 * 24 * 60 * 60 * 1000;

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

const rowToMapping = (row: SeriesRow): SeriesMapping => {
  const movies = [...row.movies]
    .sort((a, b) => a.position - b.position)
    .map(toMovie);
  return {
    anilistAnimeId: row.anilist_anime_id,
    anilistMangaId: row.anilist_manga_id,
    title: row.title,
    sourceNotes: row.source_notes ?? undefined,
    mappings: [...row.arc_mappings]
      .sort((a, b) => a.position - b.position)
      .map(toArc),
    movies: movies.length > 0 ? movies : undefined,
  };
};

const fetchCatalog = async (): Promise<Catalog> => {
  const [seriesRes, aliasRes, genreRes] = await Promise.all([
    supabase
      .from("series")
      .select("*, arc_mappings(*), movies(*)")
      .order("id", { ascending: true }),
    supabase.from("search_aliases").select("alias, target"),
    supabase
      .from("genre_filters")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (seriesRes.error) throw seriesRes.error;
  if (aliasRes.error) throw aliasRes.error;
  if (genreRes.error) throw genreRes.error;

  const mappings = seriesRes.data.map(rowToMapping);

  // Both the anime and manga id resolve to the series. First-listed wins so a
  // shared manga id keeps the old `findMappingByMediaId` array-order tie-break
  // (series are fetched ordered by id, i.e. original ALL_MAPPINGS order).
  const byMediaId = mappings.reduce((acc, m) => {
    if (!acc.has(m.anilistAnimeId)) acc.set(m.anilistAnimeId, m);
    if (!acc.has(m.anilistMangaId)) acc.set(m.anilistMangaId, m);
    return acc;
  }, new Map<number, SeriesMapping>());

  const aliases = aliasRes.data.reduce<Record<string, string>>((acc, a) => {
    acc[a.alias] = a.target;
    return acc;
  }, {});

  const genreFilters = genreRes.data.map(
    (g): GenreFilter => ({
      id: g.id,
      label: g.label,
      kind: g.kind === "tag" ? "tag" : "genre",
      token: g.token,
    }),
  );

  return { mappings, byMediaId, aliases, genreFilters };
};

export const useCatalogQuery = () =>
  useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: fetchCatalog,
    staleTime: CATALOG_STALE_MS,
    gcTime: CATALOG_GC_MS,
  });

export type CatalogAccess = {
  findMapping: (mediaId: number) => SeriesMapping | null;
  mappings: SeriesMapping[];
  isLoaded: boolean;
};

export const useCatalog = (): CatalogAccess => {
  const { data, isSuccess } = useCatalogQuery();
  return {
    findMapping: (mediaId) => data?.byMediaId.get(mediaId) ?? null,
    mappings: data?.mappings ?? [],
    isLoaded: isSuccess,
  };
};

export const useMapping = (mediaId: number): SeriesMapping | null => {
  const { data } = useCatalogQuery();
  return data?.byMediaId.get(mediaId) ?? null;
};

export const useGenreFilters = (): GenreFilter[] => {
  const { data } = useCatalogQuery();
  return data?.genreFilters ?? [];
};

// Pushes the DB-backed alias table into the module singleton read by the
// (non-React) AniList query functions. Reads from query data — not the fetch —
// so it also runs on a cache-restored start where fetchCatalog never fires.
// Call once, high in the tree.
export const useHydrateSearchAliases = (): void => {
  const { data } = useCatalogQuery();
  useEffect(() => {
    if (data) setSearchAliases(data.aliases);
  }, [data]);
};
