import { useMemo } from "react";
import { partnerIdFor, toSeriesEntry } from "@/data/pairing";
import { useResolvedMapping } from "@/queries/catalog";
import { useMedia } from "@/queries/media";
import type { AniListMediaDetail, ResolvedMapping, SeriesEntry } from "@/types";

export type SeriesView = {
  entry: SeriesEntry<AniListMediaDetail> | null;
  resolved: ResolvedMapping | null;
  isLoading: boolean;
};

/**
 * One series from either side's AniList id: the media, its partner (named by
 * the curated mapping when there is one, else by AniList), and its mapping.
 */
export function useSeries(id: number | null): SeriesView {
  const { data: media, isLoading } = useMedia(id);
  const resolved = useResolvedMapping({ id, media: media ?? null });
  const curated = resolved?.source === "curated" ? resolved.mapping : null;
  const partnerId = media ? partnerIdFor({ media, curated }) : null;
  const { data: partner } = useMedia(partnerId);

  const entry = useMemo(
    () =>
      media
        ? toSeriesEntry({ media, partnerId, partner: partner ?? null })
        : null,
    [media, partnerId, partner],
  );

  return { entry, resolved, isLoading };
}
