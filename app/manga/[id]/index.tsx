import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getMedia } from "@/api/anilist";
import { getMangaDexInfoByAniListId } from "@/api/mangadex";
import { buildSyntheticMapping } from "@/data";
import { useCatalog } from "@/data/catalog";
import { EpisodeChapterRail } from "@/components/EpisodeChapterRail";
import { Footer } from "@/components/Footer";
import { Paragraph } from "@/components/Paragraph";
import { QuickLookup } from "@/components/QuickLookup";
import { SeasonCoverage } from "@/components/SeasonCoverage";
import { VolumesGrid } from "@/components/VolumesGrid";
import {
  formatAniListDate,
  formatAniListDateJa,
  localeLabel,
} from "@/data/format";
import { COLOR, FONT } from "@/theme";

export default function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);

  const { data: media, isLoading } = useQuery({
    queryKey: ["media", mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !Number.isNaN(mediaId),
  });

  const preferredTitle = media?.title.english ?? media?.title.romaji ?? "";

  const { data: mangadex, isFetching: mangadexLoading } = useQuery({
    queryKey: ["mangadex", mediaId, preferredTitle],
    queryFn: () => getMangaDexInfoByAniListId(mediaId, preferredTitle),
    enabled: !!media && media.type === "MANGA" && !!preferredTitle,
    staleTime: 60 * 60 * 1000,
  });

  const { findMapping, isLoaded: catalogLoaded } = useCatalog();
  const curatedMapping = findMapping(mediaId);
  const syntheticMapping = useMemo(
    () =>
      media && catalogLoaded && !curatedMapping
        ? buildSyntheticMapping(media)
        : null,
    [media, catalogLoaded, curatedMapping],
  );
  const mapping = curatedMapping ?? syntheticMapping;
  const isAutoEstimated = !curatedMapping && !!syntheticMapping;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLOR.accent} />
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Could not load manga.</Text>
      </View>
    );
  }

  const totalVolumes = mangadex?.volumes ?? media.volumes ?? null;
  const totalChapters = mangadex?.chapters ?? media.chapters ?? null;
  const status = media.status?.toLowerCase() ?? null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={{ uri: media.coverImage.large }}
          accessibilityLabel={`Cover art for ${media.title.english ?? media.title.romaji}`}
          style={styles.cover}
        />
        <View style={styles.headerMeta}>
          <Text style={styles.title}>
            {media.title.english ?? media.title.romaji}
          </Text>
          {!!media.title.native && (
            <Text style={styles.titleNative}>{media.title.native}</Text>
          )}
          <Text style={styles.sub}>
            MANGA · {totalChapters ?? "?"} ch · {totalVolumes ?? "?"} vol
            {media.format ? ` · ${media.format}` : ""}
            {status ? ` · ${status}` : ""}
          </Text>
          {!!media.startDate.year && (
            <Text style={styles.dates}>
              Started {formatAniListDate(media.startDate)}
              {media.countryOfOrigin === "JP"
                ? `  ·  ${formatAniListDateJa(media.startDate)}`
                : ""}
            </Text>
          )}
          {!!media.endDate?.year && (
            <Text style={styles.dates}>
              Ended {formatAniListDate(media.endDate)}
            </Text>
          )}
          {media.genres.length > 0 && (
            <View style={styles.tagRow}>
              {media.genres.map((g) => (
                <View key={g} style={styles.tag}>
                  <Text style={styles.tagText}>{g}</Text>
                </View>
              ))}
            </View>
          )}
          {media.description && (
            <Paragraph style={styles.description} numberOfLines={8}>
              {media.description.replace(/<[^>]+>/g, "")}
            </Paragraph>
          )}
        </View>
      </View>

      {mapping ? (
        <View style={styles.mappingBlock}>
          <Text style={styles.sectionTitle}>Anime episode coverage</Text>
          <Paragraph style={styles.sectionLead}>
            This manga is adapted across the following anime arcs. Tap a band
            for episode-by-episode chapter alignment.
          </Paragraph>
          {isAutoEstimated && (
            <View style={styles.autoBanner}>
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>AUTO-ESTIMATED</Text>
              </View>
              <Paragraph style={styles.autoBannerBody}>
                Linear pacing — anime episode count distributed evenly across
                the manga chapter count. Real pacing varies; a curated mapping
                overrides this estimate.
              </Paragraph>
            </View>
          )}
          <EpisodeChapterRail
            mapping={mapping}
            seriesId={String(mediaId)}
            totalChapters={totalChapters}
          />
          {!!curatedMapping && (
            <View style={styles.seasonWrap}>
              <SeasonCoverage mapping={curatedMapping} />
            </View>
          )}
          <QuickLookup mapping={mapping} lead="chapter" showSeason />
        </View>
      ) : (
        <View style={styles.noMapping}>
          <Text style={styles.noMappingTitle}>
            No anime adaptation mapped yet
          </Text>
          <Paragraph style={styles.noMappingBody}>
            No curated or auto-estimated mapping is available for this manga
            yet.
          </Paragraph>
        </View>
      )}

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

      {mangadex && mangadex.titles.length > 1 && (
        <View style={styles.titlesBlock}>
          <Text style={styles.sectionTitle}>Titles & translations</Text>
          <View style={styles.titlesList}>
            {mangadex.titles.map((t, idx) => (
              <View key={`${t.locale}-${idx}`} style={styles.titleRow}>
                <Text style={styles.titleLocale}>{localeLabel(t.locale)}</Text>
                <Text style={styles.titleValue}>{t.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

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
  header: { flexDirection: "row", gap: 16 },
  cover: { width: 140, height: 200, backgroundColor: COLOR.coverPlaceholder },
  headerMeta: { flex: 1, gap: 6, minWidth: 240 },
  title: {
    color: COLOR.textPrimary,
    fontSize: 32,
    letterSpacing: -1,
    fontFamily: FONT.bold,
    lineHeight: 36,
  },
  titleNative: {
    color: COLOR.textSecondary,
    fontSize: 18,
    fontFamily: FONT.medium,
    marginTop: -2,
  },
  sub: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
    paddingTop: 2,
  },
  dates: {
    color: COLOR.textSecondary,
    fontSize: 13,
    fontFamily: FONT.medium,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 4 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 2,
    borderLeftColor: COLOR.accent,
  },
  tagText: {
    color: COLOR.textSecondary,
    fontSize: 11,
    letterSpacing: 0.8,
    fontFamily: FONT.semibold,
    textTransform: "uppercase",
  },
  description: {
    color: COLOR.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 8,
    fontFamily: FONT.regular,
  },
  sectionTitle: {
    color: COLOR.textPrimary,
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  sectionLead: {
    color: COLOR.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT.regular,
    marginTop: -4,
  },
  empty: { color: COLOR.textMuted, fontFamily: FONT.regular, paddingTop: 8 },
  spinnerWrap: { paddingTop: 12 },
  seasonWrap: { paddingTop: 4 },
  mappingBlock: { gap: 10 },
  autoBanner: {
    padding: 14,
    backgroundColor: COLOR.surfaceNotice,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.notice,
    gap: 8,
  },
  autoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLOR.notice,
  },
  autoBadgeText: {
    color: COLOR.background,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONT.bold,
  },
  autoBannerBody: {
    color: COLOR.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT.regular,
  },
  noMapping: {
    padding: 16,
    backgroundColor: COLOR.surface,
    gap: 6,
  },
  noMappingTitle: { color: COLOR.notice, fontFamily: FONT.bold },
  noMappingBody: {
    color: COLOR.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT.regular,
  },
  volumesBlock: { gap: 12 },
  titlesBlock: { gap: 8 },
  titlesList: { gap: 6 },
  titleRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "baseline",
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.surfaceRaised,
  },
  titleLocale: {
    color: COLOR.accent,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
    minWidth: 130,
  },
  titleValue: {
    color: COLOR.textPrimary,
    fontSize: 14,
    flex: 1,
    fontFamily: FONT.regular,
  },
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
