import { useQuery } from "@tanstack/react-query";
import { getMedia, getMediaByIds } from "@/api/anilist";
import { appMangaDexClient, getMangaDexSnapshot } from "@/api/mangadex";
import { fetchCachedMangaDex } from "@/api/mangadexCache";
import { englishTitle } from "@/data/format";
import { snapshotToInfo } from "@/data/mangadexSnapshot";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "@/data/time";
import { disabledQuery } from "@/queries/shared";
import type { AniListMedia } from "@/types";

/** One AniList entry with its relations; `null` waits for an id. */
export function useMedia(id: number | null) {
  return useQuery({
    queryKey: ["media", id],
    queryFn: () => (id === null ? disabledQuery() : getMedia(id)),
    enabled: id !== null,
    staleTime: 5 * MINUTE_MS,
  });
}

/** Several AniList entries at once, keyed on the id list in order. */
export function useMediaByIds(ids: readonly number[]) {
  return useQuery({
    queryKey: ["media-by-ids", ids.join(",")],
    queryFn: () => getMediaByIds(ids),
    enabled: ids.length > 0,
    staleTime: HOUR_MS,
  });
}

/**
 * MangaDex covers, titles and counts for a manga. The Supabase cache first, one
 * read for the whole series; the live lookup by title for a manga the cache
 * has no row for. A failed cache read also falls through, so the cache can
 * only speed the page up, never blank it.
 */
export function useMangaDex(manga: AniListMedia | null) {
  const title = manga ? englishTitle(manga.title) : "";
  return useQuery({
    queryKey: ["mangadex", manga?.id ?? null, title],
    queryFn: async () => {
      if (manga === null) return disabledQuery();
      const snapshot =
        (await fetchCachedMangaDex(manga.id).catch(() => null)) ??
        (await getMangaDexSnapshot({
          client: appMangaDexClient,
          anilistId: manga.id,
          title,
        }));
      // Covers resolve under the client's covers base, so a web build routes
      // them through its proxy and a native one reads the CDN directly.
      return (
        snapshot &&
        snapshotToInfo({ snapshot, coversBase: appMangaDexClient.covers })
      );
    },
    enabled: manga !== null && !!title,
    staleTime: DAY_MS,
  });
}
