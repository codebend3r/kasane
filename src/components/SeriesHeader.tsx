import { Image, StyleSheet, Text, View } from "react-native";
import type { AniListMedia, SeriesBadge } from "@/types";
import { formatAniListDate, formatAniListDateJa } from "@/data/format";
import { usePreferences } from "@/state/preferences";
import { Paragraph } from "@/components/Paragraph";
import { COLOR, FONT } from "@/theme";

const BADGE_LABEL: Record<SeriesBadge, string> = {
  both: "ANIME + MANGA",
  "manga-only": "MANGA ONLY",
  "anime-only": "ANIME ONLY",
};

type SeriesHeaderProps = {
  media: AniListMedia;
  badge: SeriesBadge;
  /** Metadata line already assembled by the route: counts, format, dates. */
  subParts: string[];
  isMapped: boolean;
  isMobile: boolean;
  mobileCoverWidth: number;
  mobileCoverHeight: number;
};

export function SeriesHeader({
  media,
  badge,
  subParts,
  isMapped,
  isMobile,
  mobileCoverWidth,
  mobileCoverHeight,
}: SeriesHeaderProps) {
  const japanese = usePreferences((s) => s.japanese);

  const title = japanese
    ? (media.title.native ?? media.title.english ?? media.title.romaji)
    : (media.title.english ?? media.title.romaji);

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      <Image
        source={{ uri: media.coverImage.large }}
        accessibilityLabel={`Cover art for ${media.title.english ?? media.title.romaji}`}
        style={[
          styles.cover,
          isMobile && { width: mobileCoverWidth, height: mobileCoverHeight },
          badge === "anime-only" && styles.coverAnimeOnly,
        ]}
      />
      <View style={[styles.headerMeta, isMobile && styles.headerMetaMobile]}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{BADGE_LABEL[badge]}</Text>
          </View>
          {isMapped && (
            <View style={[styles.badge, styles.mappedBadge]}>
              <Text style={styles.badgeText}>MAPPED</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        {!!(media.title.native && !japanese) && (
          <Text style={styles.titleNative}>{media.title.native}</Text>
        )}
        <Text style={styles.sub}>{subParts.join("  ·  ")}</Text>
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
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", gap: 16 },
  headerMobile: { flexDirection: "column", alignItems: "center" },
  cover: { width: 240, height: 340, backgroundColor: COLOR.coverPlaceholder },
  coverAnimeOnly: {
    borderWidth: 2,
    borderColor: COLOR.accent,
    borderBottomRightRadius: 16,
    cornerBottomRightShape: "bevel",
    overflow: "hidden",
  },
  headerMeta: { flex: 1, gap: 6, minWidth: 240 },
  headerMetaMobile: { flex: 0, minWidth: 0, alignSelf: "stretch" },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingBottom: 2,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLOR.accent,
  },
  badgeText: {
    color: COLOR.background,
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
  mappedBadge: { backgroundColor: COLOR.highlight },
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
});
