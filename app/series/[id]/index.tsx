import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getMedia } from "@/api/anilist";
import { getMangaDexInfoByAniListId } from "@/api/mangadex";
import { buildSyntheticMapping } from "@/data";
import { useCatalog } from "@/data/catalog";
import { MappingSection } from "@/components/MappingSection";
import { SeriesHeader } from "@/components/SeriesHeader";
import { TitlesList } from "@/components/TitlesList";
import { VolumesGrid } from "@/components/VolumesGrid";
import { MOBILE_WIDTH_BREAKPOINT } from "@/components/CoverCarousel";
import { Footer } from "@/components/Footer";
import { formatAniListDate } from "@/data/format";
import type { SeriesBadge } from "@/types";
import { COLOR, FONT } from "@/theme";

export default function SeriesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < MOBILE_WIDTH_BREAKPOINT;
  const mobileCoverWidth = Math.min(windowWidth - 32, 420);
  const mobileCoverHeight = Math.round(mobileCoverWidth * (340 / 240));

  const { data: media, isLoading } = useQuery({
    queryKey: ["media", mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !Number.isNaN(mediaId),
  });

  const { findMapping, isLoaded: catalogLoaded } = useCatalog();
  const curatedMapping = findMapping(mediaId);

  const partnerId = useMemo(() => {
    if (!media) return null;
    if (curatedMapping) {
      return media.id === curatedMapping.anilistAnimeId
        ? curatedMapping.anilistMangaId
        : curatedMapping.anilistAnimeId;
    }
    const targetType = media.type === "MANGA" ? "ANIME" : "MANGA";
    const targetRelation = media.type === "MANGA" ? "ADAPTATION" : "SOURCE";
    const edge = media.relations?.edges.find(
      (e) => e.relationType === targetRelation && e.node.type === targetType,
    );
    return edge?.node.id ?? null;
  }, [media, curatedMapping]);

  const { data: partner } = useQuery({
    queryKey: ["media", partnerId],
    queryFn: () => getMedia(partnerId!),
    enabled: !!partnerId,
  });

  const manga =
    media?.type === "MANGA"
      ? media
      : partner?.type === "MANGA"
        ? partner
        : null;
  const anime =
    media?.type === "ANIME"
      ? media
      : partner?.type === "ANIME"
        ? partner
        : null;
  const primary = manga ?? anime ?? null;

  const mangaPreferredTitle = manga?.title.english ?? manga?.title.romaji ?? "";
  const { data: mangadex, isFetching: mangadexLoading } = useQuery({
    queryKey: ["mangadex", manga?.id, mangaPreferredTitle],
    queryFn: () => getMangaDexInfoByAniListId(manga!.id, mangaPreferredTitle),
    enabled: !!manga && !!mangaPreferredTitle,
    staleTime: 60 * 60 * 1000,
  });

  const syntheticMapping = useMemo(
    () =>
      media && catalogLoaded && !curatedMapping
        ? buildSyntheticMapping(media)
        : null,
    [media, catalogLoaded, curatedMapping],
  );
  const mapping = curatedMapping ?? syntheticMapping;

  const routeId = manga?.id ?? anime?.id ?? mediaId;

  const badge: SeriesBadge = useMemo(() => {
    if (!media) return "manga-only";
    if (media.type === "MANGA") {
      const hasAdapter = media.relations?.edges.some(
        (e) => e.relationType === "ADAPTATION" && e.node.type === "ANIME",
      );
      return hasAdapter ? "both" : "manga-only";
    }
    const hasSource = media.relations?.edges.some(
      (e) => e.relationType === "SOURCE" && e.node.type === "MANGA",
    );
    return hasSource ? "both" : "anime-only";
  }, [media]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLOR.accent} />
      </View>
    );
  }

  if (!media || !primary) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Could not load series.</Text>
      </View>
    );
  }

  const totalVolumes = mangadex?.volumes ?? manga?.volumes ?? null;
  const totalChapters = mangadex?.chapters ?? manga?.chapters ?? null;
  const totalEpisodes = mapping
    ? (() => {
        const eps = mapping.mappings
          .map((m) => m.episodes?.[1])
          .filter((v): v is number => typeof v === "number");
        return eps.length > 0 ? Math.max(...eps) : (anime?.episodes ?? null);
      })()
    : (anime?.episodes ?? null);
  const status = primary.status?.toLowerCase() ?? null;
  const showAnimeStats = badge !== "manga-only";
  const showMangaStats = badge !== "anime-only";

  const subParts: string[] = [];
  if (showMangaStats) {
    subParts.push(`${totalChapters ?? "?"} ch`);
    subParts.push(`${totalVolumes ?? "?"} vol`);
  }
  const movies = curatedMapping?.movies ?? [];
  if (showAnimeStats) {
    subParts.push(`${totalEpisodes ?? "?"} eps`);
    if (movies.length > 0) {
      subParts.push(
        `${movies.length} ${movies.length === 1 ? "movie" : "movies"}`,
      );
    }
  }
  if (primary.format) subParts.push(primary.format);
  if (primary.startDate.year) {
    subParts.push(formatAniListDate(primary.startDate));
  } else if (status) {
    subParts.push(status);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SeriesHeader
        media={primary}
        badge={badge}
        subParts={subParts}
        isMapped={!!curatedMapping}
        isMobile={isMobile}
        mobileCoverWidth={mobileCoverWidth}
        mobileCoverHeight={mobileCoverHeight}
      />

      <MappingSection
        mapping={mapping}
        curatedMapping={curatedMapping}
        routeId={routeId}
        totalChapters={totalChapters}
        badge={badge}
        isMobile={isMobile}
      />

      {manga && (
        <View style={styles.volumesBlock}>
          <Text style={styles.sectionTitle}>Volumes</Text>
          {mangadexLoading && !mangadex ? (
            <View style={styles.spinnerWrap}>
              <ActivityIndicator color={COLOR.accent} />
            </View>
          ) : mangadex && mangadex.covers.length > 0 ? (
            <VolumesGrid covers={mangadex.covers} />
          ) : (
            <Text style={styles.empty}>
              No volume art on MangaDex for this title.
            </Text>
          )}
        </View>
      )}

      {!!mangadex && <TitlesList titles={mangadex.titles} />}

      <View style={styles.sourcesWrap}>
        <View style={styles.sources}>
          <Text style={styles.sourcesText}>
            Data: AniList (metadata) · MangaDex (volume covers, multilingual
            titles)
          </Text>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 24, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: {
    color: COLOR.textPrimary,
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  empty: { color: COLOR.textMuted, fontFamily: FONT.regular, paddingTop: 8 },
  spinnerWrap: { paddingTop: 12 },
  volumesBlock: { gap: 12 },
  sourcesWrap: { paddingTop: 8 },
  sources: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.surfaceRaised,
  },
  sourcesText: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    fontFamily: FONT.regular,
  },
});
