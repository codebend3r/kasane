import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCoversByIds } from "@/api/anilist";

export type Cover = { url: string; color: string | null };
export type CoverMap = Record<number, Cover>;

export const COVERS_QUERY_KEY = ["covers"] as const;

// Cover art effectively never changes, and the batch costs a dozen AniList
// calls, so keep it a week — the same window as the persisted catalog.
const COVERS_STALE_MS = 7 * 24 * 60 * 60 * 1000;

const EMPTY_COVERS: CoverMap = {};

// Order-independent digest of the id set. Keeps the query key stable across
// renders and re-sorts, and changes only when the catalog gains or loses a
// series — which is exactly when the covers need refetching.
const digest = (ids: readonly number[]): string =>
  `${ids.length}:${ids.reduce((sum, id) => sum + id, 0)}`;

/**
 * Poster art for a set of AniList media ids, keyed by id. Returns an empty map
 * until the fetch lands, so callers render their placeholder in the meantime.
 */
export const useCovers = (ids: readonly number[]): CoverMap => {
  const key = digest(ids);
  const { data } = useQuery({
    queryKey: [...COVERS_QUERY_KEY, key],
    queryFn: () => getCoversByIds(ids),
    enabled: ids.length > 0,
    staleTime: COVERS_STALE_MS,
    gcTime: COVERS_STALE_MS,
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
};
