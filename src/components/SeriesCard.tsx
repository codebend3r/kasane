import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { SeriesBadge, SeriesEntry } from "@/types";
import { COLOR, FONT } from "@/theme";
import { useMapping } from "@/data/catalog";
import { getAnimeFranchise, hasAnimeSequels } from "@/api/anilist";
import { usePreferences } from "@/state/preferences";
import { useSeriesProgress } from "@/state/progress";

const BADGE_LABEL: Record<SeriesBadge, string> = {
  both: "ANIME + MANGA",
  "manga-only": "MANGA ONLY",
  "anime-only": "ANIME ONLY",
};

const BADGE_COLOR: Record<SeriesBadge, string> = {
  both: COLOR.accent,
  "manga-only": COLOR.sideManga,
  "anime-only": COLOR.sideAnime,
};

export function SeriesCard({ entry }: { entry: SeriesEntry }) {
  const { primary, anime, manga, badge, routeId } = entry;
  const japanese = usePreferences((s) => s.japanese);
  const progress = useSeriesProgress(routeId);
  const title = japanese
    ? (primary.title.native ?? primary.title.english ?? primary.title.romaji)
    : (primary.title.english ?? primary.title.romaji);

  const mapping = useMapping(routeId);
  const mappedEpisodeCount = mapping
    ? (() => {
        const eps = mapping.mappings
          .map((m) => m.episodes?.[1] ?? null)
          .filter((v): v is number => typeof v === "number");
        return eps.length > 0 ? Math.max(...eps) : null;
      })()
    : null;
  const hasMapping = mapping != null;

  const hasAnime = badge !== "manga-only";
  const hasManga = badge !== "anime-only";
  const animeTotal = mappedEpisodeCount ?? anime?.episodes ?? null;
  const mangaTotal = manga?.chapters ?? null;
  const animeFrac =
    progress?.anime && animeTotal
      ? Math.min(progress.anime.position, animeTotal) / animeTotal
      : null;
  const mangaFrac =
    progress?.manga && mangaTotal
      ? Math.min(progress.manga.position, mangaTotal) / mangaTotal
      : null;
  const showProgressBar =
    (hasAnime && animeFrac !== null) || (hasManga && mangaFrac !== null);

  const sequels = !!anime && hasAnimeSequels(anime);
  const { data: franchise } = useQuery({
    queryKey: ["franchise", anime?.id ?? 0],
    queryFn: () => getAnimeFranchise(anime?.id ?? 0),
    enabled: sequels,
    staleTime: 24 * 60 * 60 * 1000,
  });
  const franchiseLabel =
    mappedEpisodeCount == null &&
    franchise &&
    franchise.tvSeasonCount > 1 &&
    franchise.totalTvEpisodes > 0
      ? `${franchise.totalTvEpisodes} eps · ${franchise.tvSeasonCount} seasons`
      : null;

  const parts: string[] = [];
  if (anime || badge === "anime-only") {
    const eps = mappedEpisodeCount ?? anime?.episodes ?? null;
    parts.push(franchiseLabel ?? (eps ? `${eps} eps` : "Anime ongoing"));
  }
  if (manga || badge === "manga-only") {
    parts.push(manga?.chapters ? `${manga.chapters} ch` : "Manga ongoing");
  }
  if (primary.startDate.year) parts.push(String(primary.startDate.year));

  return (
    <Link href={{ pathname: "/series/[id]", params: { id: routeId } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${title}. ${parts.join(", ")}`}
        style={styles.card}
      >
        <View style={styles.cardRow}>
          <Image
            source={{ uri: primary.coverImage.large }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.cover,
              {
                backgroundColor:
                  primary.coverImage.color ?? COLOR.coverPlaceholder,
              },
            ]}
          />
          <View style={styles.meta}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.sub}>{parts.join(" · ")}</Text>
          </View>
          <View style={styles.badges}>
            <View
              style={[styles.badge, { backgroundColor: BADGE_COLOR[badge] }]}
            >
              <Text style={styles.badgeText}>{BADGE_LABEL[badge]}</Text>
            </View>
            {hasMapping && (
              <View style={[styles.badge, styles.mappedBadge]}>
                <Text style={styles.badgeText}>MAPPED</Text>
              </View>
            )}
          </View>
        </View>
        {showProgressBar && (
          <ProgressBar
            hasAnime={hasAnime}
            hasManga={hasManga}
            animeFrac={animeFrac}
            mangaFrac={mangaFrac}
          />
        )}
      </Pressable>
    </Link>
  );
}

function ProgressBar({
  hasAnime,
  hasManga,
  animeFrac,
  mangaFrac,
}: {
  hasAnime: boolean;
  hasManga: boolean;
  animeFrac: number | null;
  mangaFrac: number | null;
}) {
  return (
    <View style={styles.progressTrack}>
      {hasAnime && (
        <View style={styles.progressBand}>
          {animeFrac !== null && (
            <View
              style={[
                styles.progressFill,
                {
                  width: `${animeFrac * 100}%`,
                  backgroundColor: COLOR.sideAnime,
                },
              ]}
            />
          )}
        </View>
      )}
      {hasManga && (
        <View style={styles.progressBand}>
          {mangaFrac !== null && (
            <View
              style={[
                styles.progressFill,
                {
                  width: `${mangaFrac * 100}%`,
                  backgroundColor: COLOR.sideManga,
                },
              ]}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.surfaceRaised,
  },
  cardRow: { flexDirection: "row", gap: 12 },
  cover: { width: 60, height: 84 },
  meta: { flex: 1, justifyContent: "center" },
  badges: { alignSelf: "center", gap: 4 },
  progressTrack: { gap: 2 },
  progressBand: {
    height: 3,
    backgroundColor: COLOR.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-end",
  },
  mappedBadge: { backgroundColor: COLOR.success },
  badgeText: {
    color: COLOR.background,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
  title: {
    color: COLOR.textPrimary,
    fontSize: 17,
    letterSpacing: -0.3,
    fontFamily: FONT.bold,
  },
  sub: {
    color: COLOR.textMuted,
    fontSize: 12,
    paddingTop: 4,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
});
