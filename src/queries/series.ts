import { useMemo } from "react";
import { partnerIdFor, toSeriesEntry } from "@/data/pairing";
import { useCatalog, useResolvedMapping } from "@/queries/catalog";
import { useMedia } from "@/queries/media";
import type { AniListMediaDetail, ResolvedMapping, SeriesEntry } from "@/types";

// The series and arc screens resolve a URL id through these two hooks, so they
// agree on which mapping an id has — curated or estimated — and on which
// partner, badge and route id the series gets.

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

/**
 * Just the mapping for an id, as `useSeries` resolves it. The media is fetched
 * only when the catalog has no entry and an estimate is needed, so a curated
 * arc opens straight from the persisted catalog.
 */
export function useSeriesMapping(id: number | null): {
  resolved: ResolvedMapping | null;
  isLoading: boolean;
} {
  const { findMapping, isLoaded } = useCatalog();
  const needsMedia = id !== null && isLoaded && !findMapping(id);
  const { data: media, isLoading } = useMedia(needsMedia ? id : null);
  const resolved = useResolvedMapping({ id, media: media ?? null });
  return { resolved, isLoading: !isLoaded || isLoading };
}
