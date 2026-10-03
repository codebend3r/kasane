import { useQuery } from "@tanstack/react-query";
import {
  getAnimeFranchise,
  getMedia,
  getMediaByIds,
  hasAnimeSequels,
} from "@/api/anilist";
import { getMangaDexInfoByAniListId } from "@/api/mangadex";
import { englishTitle } from "@/data/format";
import { DAY_MS, HOUR_MS, MINUTE_MS, disabledQuery } from "@/queries/shared";
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
    queryFn: () => getMediaByIds([...ids]),
    enabled: ids.length > 0,
    staleTime: HOUR_MS,
  });
}

/** Every season of an anime's franchise; skipped when it has no sequels. */
export function useFranchise(anime: AniListMedia | null) {
  return useQuery({
    queryKey: ["franchise", anime?.id ?? null],
    queryFn: () =>
      anime === null ? disabledQuery() : getAnimeFranchise(anime.id),
    enabled: anime !== null && hasAnimeSequels(anime),
    staleTime: DAY_MS,
  });
}

/** MangaDex covers, titles and counts for a manga, matched by its title. */
export function useMangaDex(manga: AniListMedia | null) {
  const title = manga ? englishTitle(manga.title) : "";
  return useQuery({
    queryKey: ["mangadex", manga?.id ?? null, title],
    queryFn: () =>
      manga === null
        ? disabledQuery()
        : getMangaDexInfoByAniListId(manga.id, title),
    enabled: manga !== null && !!title,
    staleTime: HOUR_MS,
  });
}
