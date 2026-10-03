import { useQuery } from "@tanstack/react-query";
import { getLatestAnime, searchMedia } from "@/api/anilist";
import type { SplitFilters } from "@/data/genreFilters";
import { applySearchAlias } from "@/data/searchAliases";
import { useSearchAliases } from "@/queries/catalog";
import { HOUR_MS, MINUTE_MS } from "@/queries/shared";

/**
 * AniList search for `query`, rewritten through the catalog's alias table. The
 * key holds the resolved term, so a search that ran before the aliases loaded
 * is not served again once they have.
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
  return useQuery({
    queryKey: ["search", term, filters.genreNotIn, filters.tagNotIn],
    queryFn: () => searchMedia({ query: term, filters }),
    enabled,
    staleTime: 5 * MINUTE_MS,
  });
}

/** The newest TV anime, one entry per franchise. */
export function useLatestAnime({
  filters,
  enabled,
}: {
  filters: SplitFilters;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["latest-anime", filters.genreNotIn, filters.tagNotIn],
    queryFn: () => getLatestAnime(filters),
    enabled,
    staleTime: HOUR_MS,
  });
}
