import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import type { SeriesBadge, SeriesEntry } from "@/types";
import { FONT } from "@/theme";
import { findMappingByMediaId } from "@/data";
import { usePreferences } from "@/state/preferences";
import { useSeriesProgress } from "@/state/progress";

const BADGE_LABEL: Record<SeriesBadge, string> = {
  both: "ANIME + MANGA",
  "manga-only": "MANGA ONLY",
  "anime-only": "ANIME ONLY",
};

const BADGE_COLOR: Record<SeriesBadge, string> = {
  both: "#7c5cff",
  "manga-only": "#ff7c5c",
  "anime-only": "#5cdfff",
};

export function SeriesCard({ entry }: { entry: SeriesEntry }) {
  const { primary, anime, manga, badge, routeId } = entry;
  const japanese = usePreferences((s) => s.japanese);
  const progress = useSeriesProgress(routeId);
  const title = japanese
    ? (primary.title.native ?? primary.title.english ?? primary.title.romaji)
    : (primary.title.english ?? primary.title.romaji);

  const mapping = findMappingByMediaId(routeId);
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

  const parts: string[] = [];
  if (anime || badge === "anime-only") {
    const eps = mappedEpisodeCount ?? anime?.episodes ?? null;
    parts.push(eps ? `${eps} eps` : "Anime ongoing");
  }
  if (manga || badge === "manga-only") {
    parts.push(manga?.chapters ? `${manga.chapters} ch` : "Manga ongoing");
  }
  if (primary.startDate.year) parts.push(String(primary.startDate.year));

  return (
    <Link href={{ pathname: "/series/[id]", params: { id: routeId } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.cardRow}>
          <Image
            source={{ uri: primary.coverImage.large }}
            style={[
              styles.cover,
              { backgroundColor: primary.coverImage.color ?? "#222" },
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
        {showProgressBar ? (
          <ProgressBar
            hasAnime={hasAnime}
            hasManga={hasManga}
            animeFrac={animeFrac}
            mangaFrac={mangaFrac}
          />
        ) : null}
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
      {hasAnime ? (
        <View style={styles.progressBand}>
          {animeFrac !== null ? (
            <View
              style={[
                styles.progressFill,
                { width: `${animeFrac * 100}%`, backgroundColor: "#5cdfff" },
              ]}
            />
          ) : null}
        </View>
      ) : null}
      {hasManga ? (
        <View style={styles.progressBand}>
          {mangaFrac !== null ? (
            <View
              style={[
                styles.progressFill,
                { width: `${mangaFrac * 100}%`, backgroundColor: "#ff7c5c" },
              ]}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a2a2a",
  },
  cardRow: { flexDirection: "row", gap: 12 },
  cover: { width: 60, height: 84 },
  meta: { flex: 1, justifyContent: "center" },
  badges: { alignSelf: "center", gap: 4 },
  progressTrack: { gap: 2 },
  progressBand: {
    height: 3,
    backgroundColor: "#1a1a1a",
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
  mappedBadge: { backgroundColor: "#5cff9d" },
  badgeText: {
    color: "#0c0c0e",
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 17,
    letterSpacing: -0.3,
    fontFamily: FONT.bold,
  },
  sub: {
    color: "#9aa0a6",
    fontSize: 12,
    paddingTop: 4,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
});
