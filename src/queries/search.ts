import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getLatestAnime, searchWithCatalog } from "@/api/anilist";
import {
  catalogMediaIds,
  matchCatalogTitles,
  mergeSearchResults,
} from "@/data/catalogSearch";
import type { SplitFilters } from "@/data/genreFilters";
import { applySearchAlias } from "@/data/searchAliases";
import { useCatalog, useSearchAliases } from "@/queries/catalog";
import { HOUR_MS, MINUTE_MS } from "@/data/time";

/**
 * AniList search for `query`, rewritten through the catalog's alias table, with
 * every catalog series whose title matches fetched and placed first. The key
 * holds the resolved term and the matched ids, so a search that ran before the
 * catalog loaded is not served again once it has.
 */
export function useSearch({
  query,
  filters,
  enabled,
}: {
  query: string;
  filters: SplitFilters;
  enabled: boolean;
}) {
  const term = applySearchAlias({ query, aliases: useSearchAliases() });
  const { mappings } = useCatalog();
  const catalogIds = useMemo(
    () => catalogMediaIds(matchCatalogTitles({ query: term, mappings })),
    [term, mappings],
  );
  return useQuery({
    queryKey: [
      "search",
      term,
      catalogIds,
      filters.genreNotIn,
      filters.tagNotIn,
    ],
    queryFn: async () => {
      const { search, catalog } = await searchWithCatalog({
        query: term,
        ids: catalogIds,
        filters,
      });
      return mergeSearchResults({
        ids: catalogIds,
        catalogMedia: catalog,
        searchMedia: search,
      });
    },
    enabled,
    staleTime: 5 * MINUTE_MS,
  });
}

/**
 * The newest TV anime, one entry per franchise, a page at a time for the home
 * screen's infinite grid. Each page is one AniList request, fetched only when
 * the reader nears the end of what is loaded.
 */
export function useLatestAnime({
  filters,
  enabled,
}: {
  filters: SplitFilters;
  enabled: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ["latest-anime", filters.genreNotIn, filters.tagNotIn],
    queryFn: ({ pageParam }) => getLatestAnime({ filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNextPage ? lastPageParam + 1 : undefined,
    enabled,
    staleTime: HOUR_MS,
  });
}
