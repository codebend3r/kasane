import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getAnimeFranchise, getMedia, hasAnimeSequels } from "@/api/anilist";
import { getMangaDexInfoByAniListId } from "@/api/mangadex";
import {
  buildSyntheticMapping,
  chapterToEpisodes,
  episodeToChapters,
} from "@/data";
import { useCatalog } from "@/data/catalog";
import { EpisodeChapterRail } from "@/components/EpisodeChapterRail";
import { Footer } from "@/components/Footer";
import { Paragraph } from "@/components/Paragraph";
import { formatAniListDate } from "@/data/format";
import type { AnimeFranchise, PressableState, SeriesMapping } from "@/types";
import { COLOR, FONT } from "@/theme";

export default function AnimeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);

  const { data: media, isLoading } = useQuery({
    queryKey: ["media", mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !Number.isNaN(mediaId),
  });

  const sequels = !!media && hasAnimeSequels(media);

  const { data: franchise } = useQuery({
    queryKey: ["franchise", mediaId],
    queryFn: () => getAnimeFranchise(mediaId),
    enabled: sequels,
    staleTime: 24 * 60 * 60 * 1000,
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

  const mappedEpisodeCount = mapping
    ? (() => {
        const eps = mapping.mappings
          .map((m) => m.episodes?.[1])
          .filter((v): v is number => typeof v === "number");
        return eps.length > 0 ? Math.max(...eps) : null;
      })()
    : null;

  const partnerManga = useMemo(() => {
    const edges = media?.relations?.edges ?? [];
    const targetId = curatedMapping?.anilistMangaId;
    const node =
      (targetId
        ? edges.find((e) => e.node.type === "MANGA" && e.node.id === targetId)
        : edges.find(
            (e) =>
              (e.relationType === "SOURCE" ||
                e.relationType === "ADAPTATION") &&
              e.node.type === "MANGA",
          )
      )?.node ?? null;
    if (!node) return null;
    const title = node.title?.english ?? node.title?.romaji ?? "";
    return { id: node.id, title, anilistChapters: node.chapters ?? null };
  }, [media, curatedMapping]);

  const { data: partnerMangadex } = useQuery({
    queryKey: ["mangadex", partnerManga?.id, partnerManga?.title],
    queryFn: () =>
      getMangaDexInfoByAniListId(partnerManga!.id, partnerManga!.title),
    enabled: !!partnerManga && !!partnerManga.title,
    staleTime: 60 * 60 * 1000,
  });

  const partnerMangaChapters =
    partnerMangadex?.chapters ?? partnerManga?.anilistChapters ?? null;

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
        <Text style={styles.empty}>Could not load anime.</Text>
      </View>
    );
  }

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
          <Text style={styles.sub}>
            ANIME · {mappedEpisodeCount ?? media.episodes ?? "?"} eps
            {media.format ? ` · ${media.format}` : ""}
            {media.startDate.year
              ? ` · ${formatAniListDate(media.startDate)}`
              : ""}
          </Text>
          {franchise && franchise.tvSeasonCount > 1 && (
            <Text style={styles.franchiseTotal}>
              Franchise total: {franchise.totalTvEpisodes} TV eps across{" "}
              {franchise.tvSeasonCount} seasons
            </Text>
          )}
          {media.description && (
            <Paragraph style={styles.description} numberOfLines={6}>
              {media.description.replace(/<[^>]+>/g, "")}
            </Paragraph>
          )}
        </View>
      </View>

      {franchise && franchise.seasons.length > 1 && (
        <SeasonsList franchise={franchise} currentId={mediaId} />
      )}

      {mapping ? (
        <>
          <Text style={styles.sectionTitle}>Episode ↔ Chapter map</Text>
          {isAutoEstimated && (
            <View style={styles.autoBanner}>
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>AUTO-ESTIMATED</Text>
              </View>
              <Paragraph style={styles.autoBannerBody}>
                Linear pacing — anime episode count distributed evenly across
                the manga chapter count. Real arcs rarely adapt at a uniform
                rate, so treat numbers as a rough guide. A curated mapping
                overrides this estimate.
              </Paragraph>
            </View>
          )}
          <EpisodeChapterRail
            mapping={mapping}
            seriesId={String(mediaId)}
            totalChapters={partnerMangaChapters}
          />
          <QuickLookup mapping={mapping} />
        </>
      ) : (
        <View style={styles.noMapping}>
          <Text style={styles.noMappingTitle}>No mapping available yet</Text>
          <Paragraph style={styles.noMappingBody}>
            We couldn&apos;t find an anime↔manga adaptation pair on AniList for
            this entry, and no curated mapping exists for it yet.
          </Paragraph>
        </View>
      )}
      <Footer />
    </ScrollView>
  );
}

function SeasonsList({
  franchise,
  currentId,
}: {
  franchise: AnimeFranchise;
  currentId: number;
}) {
  return (
    <View style={styles.seasons}>
      <Text style={styles.sectionTitle}>Seasons & entries</Text>
      <View style={styles.seasonGrid}>
        {franchise.seasons.map((s) => {
          const isCurrent = s.id === currentId;
          return (
            <Link
              key={s.id}
              href={{ pathname: "/anime/[id]", params: { id: s.id } }}
              asChild
            >
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${s.title}${isCurrent ? ", current season" : ""}`}
                style={({ hovered, pressed }: PressableState) => [
                  styles.seasonCard,
                  isCurrent && styles.seasonCardActive,
                  { opacity: pressed ? 0.6 : hovered ? 0.9 : 1 },
                ]}
              >
                <Text style={styles.seasonCardTitle} numberOfLines={2}>
                  {s.title}
                </Text>
                <Text style={styles.seasonCardMeta}>
                  {s.format ?? "—"}
                  {s.episodes ? ` · ${s.episodes} eps` : ""}
                  {s.year ? ` · ${s.year}` : ""}
                </Text>
                {isCurrent && (
                  <Text style={styles.seasonCardCurrent}>VIEWING</Text>
                )}
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

function QuickLookup({ mapping }: { mapping: SeriesMapping | null }) {
  const [epInput, setEpInput] = useState("");
  const [chInput, setChInput] = useState("");

  if (!mapping) return null;

  const epNum = Number(epInput);
  const chNum = Number(chInput);
  const fromEp =
    !Number.isNaN(epNum) && epNum > 0
      ? episodeToChapters(mapping, epNum)
      : null;
  const fromCh =
    !Number.isNaN(chNum) && chNum > 0
      ? chapterToEpisodes(mapping, chNum)
      : null;

  return (
    <View style={styles.lookup}>
      <Text style={styles.sectionTitle}>Quick lookup</Text>
      <View style={styles.lookupRow}>
        <Text style={styles.lookupLabel}>I finished episode</Text>
        <TextInput
          value={epInput}
          onChangeText={setEpInput}
          keyboardType="number-pad"
          style={styles.lookupInput}
          placeholder="e.g. 12"
          accessibilityLabel="I finished episode"
          placeholderTextColor={COLOR.textFaint}
        />
        <Text
          style={styles.lookupResult}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            fromEp ? `chapters ${fromEp[0]} to ${fromEp[1]}` : "no match"
          }
        >
          → {fromEp ? `chapters ${fromEp[0]}–${fromEp[1]}` : "—"}
        </Text>
      </View>
      <View style={styles.lookupRow}>
        <Text style={styles.lookupLabel}>I finished chapter</Text>
        <TextInput
          value={chInput}
          onChangeText={setChInput}
          keyboardType="number-pad"
          style={styles.lookupInput}
          placeholder="e.g. 50"
          accessibilityLabel="I finished chapter"
          placeholderTextColor={COLOR.textFaint}
        />
        <Text
          style={styles.lookupResult}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            fromCh ? `episodes ${fromCh[0]} to ${fromCh[1]}` : "no match"
          }
        >
          → {fromCh ? `episodes ${fromCh[0]}–${fromCh[1]}` : "—"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", gap: 16 },
  cover: { width: 110, height: 154, backgroundColor: COLOR.coverPlaceholder },
  headerMeta: { flex: 1, gap: 6 },
  title: {
    color: COLOR.textPrimary,
    fontSize: 28,
    letterSpacing: -0.8,
    fontFamily: FONT.bold,
  },
  sub: {
    color: COLOR.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
  description: {
    color: COLOR.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 6,
    fontFamily: FONT.regular,
  },
  sectionTitle: {
    color: COLOR.textPrimary,
    fontSize: 18,
    paddingTop: 10,
    letterSpacing: -0.3,
    fontFamily: FONT.bold,
  },
  empty: { color: COLOR.textMuted, fontFamily: FONT.regular },
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
  lookup: { gap: 12, paddingTop: 8 },
  lookupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  lookupLabel: {
    color: COLOR.textSecondary,
    fontSize: 13,
    fontFamily: FONT.medium,
  },
  lookupInput: {
    backgroundColor: COLOR.surface,
    color: COLOR.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 80,
    fontFamily: FONT.regular,
  },
  lookupResult: { color: COLOR.accent, fontSize: 13, fontFamily: FONT.bold },
  franchiseTotal: {
    color: COLOR.accent,
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.semibold,
    paddingTop: 2,
  },
  seasons: { gap: 10, paddingTop: 4 },
  seasonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  seasonCard: {
    width: 220,
    padding: 12,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
    gap: 6,
  },
  seasonCardActive: {
    backgroundColor: COLOR.surfaceNotice,
    borderLeftColor: COLOR.notice,
  },
  seasonCardTitle: {
    color: COLOR.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: FONT.semibold,
    letterSpacing: -0.2,
  },
  seasonCardMeta: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
  seasonCardCurrent: {
    color: COLOR.notice,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
});
