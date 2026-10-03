import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/api/catalog";
import { indexByMediaId, type Catalog } from "@/data/catalog";
import type { GenreFilter } from "@/data/genreFilters";
import { HOUR_MS, WEEK_MS } from "@/queries/shared";
import type { SeriesMapping } from "@/types";

export const CATALOG_QUERY_KEY = ["catalog"] as const;

type CatalogView = Catalog & { byMediaId: Map<number, SeriesMapping> };

// The index is built in `select`, not stored on the payload: the payload is
// persisted to AsyncStorage as JSON, and a `Map` does not survive that round
// trip. With a stable `select`, react-query rebuilds the index only when a new
// payload lands.
const withIndex = (catalog: Catalog): CatalogView => ({
  ...catalog,
  byMediaId: indexByMediaId(catalog.mappings),
});

const EMPTY_MAPPINGS: SeriesMapping[] = [];
const EMPTY_INDEX = new Map<number, SeriesMapping>();
const EMPTY_FILTERS: GenreFilter[] = [];
const EMPTY_ALIASES: Record<string, string> = {};

/**
 * Refetch at most hourly; keep the persisted copy for a week so a cold launch
 * renders instantly (and offline) from cache while a background refresh runs.
 */
export function useCatalogQuery() {
  return useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: fetchCatalog,
    staleTime: HOUR_MS,
    gcTime: WEEK_MS,
    select: withIndex,
  });
}

export type CatalogAccess = {
  findMapping: (mediaId: number) => SeriesMapping | null;
  mappings: SeriesMapping[];
  isLoaded: boolean;
};

/** Stable per catalog payload, so it is safe in a `useMemo` dependency list. */
export function useCatalog(): CatalogAccess {
  const { data, isSuccess } = useCatalogQuery();
  return useMemo(() => {
    const byMediaId = data?.byMediaId ?? EMPTY_INDEX;
    return {
      findMapping: (mediaId) => byMediaId.get(mediaId) ?? null,
      mappings: data?.mappings ?? EMPTY_MAPPINGS,
      isLoaded: isSuccess,
    };
  }, [data, isSuccess]);
}

export function useMapping(mediaId: number): SeriesMapping | null {
  const { data } = useCatalogQuery();
  return data?.byMediaId.get(mediaId) ?? null;
}

export function useGenreFilters(): GenreFilter[] {
  const { data } = useCatalogQuery();
  return data?.genreFilters ?? EMPTY_FILTERS;
}

/** Empty until the catalog lands, so a search passes through un-aliased. */
export function useSearchAliases(): Record<string, string> {
  const { data } = useCatalogQuery();
  return data?.aliases ?? EMPTY_ALIASES;
}
