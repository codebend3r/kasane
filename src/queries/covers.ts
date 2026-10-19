import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCoversByIds } from "@/api/anilist";
import { WEEK_MS } from "@/queries/shared";

export type Cover = { url: string; color: string | null };
export type CoverMap = Record<number, Cover>;

export const COVERS_QUERY_KEY = ["covers"] as const;

const EMPTY_COVERS: CoverMap = {};

// The id set, sorted and de-duplicated. Keeps the query key stable across
// renders and re-sorts, and changes only when the catalog gains or loses a
// series — which is exactly when the covers need refetching.
const idSetKey = (ids: readonly number[]): string =>
  [...new Set(ids)].sort((a, b) => a - b).join(",");

/**
 * Poster art for a set of AniList media ids, keyed by id. Returns an empty map
 * until the fetch lands, so callers render their placeholder in the meantime.
 *
 * Cover art effectively never changes, and the batch costs a dozen AniList
 * calls, so keep it a week — the same window as the persisted catalog.
 */
export function useCovers(ids: readonly number[]): CoverMap {
  const { data } = useQuery({
    queryKey: [...COVERS_QUERY_KEY, idSetKey(ids)],
    queryFn: () => getCoversByIds(ids),
    enabled: ids.length > 0,
    staleTime: WEEK_MS,
    gcTime: WEEK_MS,
  });

  return useMemo(
    () =>
      data
        ? Object.fromEntries(
            data.map((m) => [
              m.id,
              { url: m.coverImage.large, color: m.coverImage.color },
            ]),
          )
        : EMPTY_COVERS,
    [data],
  );
}
