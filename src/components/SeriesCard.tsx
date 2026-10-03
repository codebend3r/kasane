import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import type { SeriesEntry } from "@/types";
import { BADGE_COLOR, COLOR, FONT, SPACE } from "@/theme";
import { useMapping } from "@/queries/catalog";
import { useFranchise } from "@/queries/media";
import { displayTitle } from "@/data/format";
import { lastMappedEpisode } from "@/data/mapping";
import { BADGE_LABEL } from "@/data/pairing";
import { usePreferences } from "@/state/preferences";
import { useSeriesProgress } from "@/state/progress";

export function SeriesCard({ entry }: { entry: SeriesEntry }) {
  const { primary, anime, manga, badge, routeId } = entry;
  const japanese = usePreferences((s) => s.japanese);
  const progress = useSeriesProgress(routeId);
  const title = displayTitle({ title: primary.title, japanese });

  const mapping = useMapping(routeId);
  const mappedEpisodeCount = mapping ? lastMappedEpisode(mapping) : null;
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

  const { data: franchise } = useFranchise(anime);
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
    gap: SPACE.sm,
    padding: SPACE.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.surfaceRaised,
  },
  cardRow: { flexDirection: "row", gap: SPACE.lg },
  cover: { width: 60, height: 84 },
  meta: { flex: 1, justifyContent: "center" },
  badges: { alignSelf: "center", gap: SPACE.xs },
  progressTrack: { gap: SPACE.xxs },
  progressBand: {
    height: 3,
    backgroundColor: COLOR.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  badge: {
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
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
    paddingTop: SPACE.xs,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
});
