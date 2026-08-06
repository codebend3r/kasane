import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  useWindowDimensions,
} from "react-native";
import { Link } from "expo-router";
import type { AniListMedia, PressableState, SeriesEntry } from "@/types";
import { pairResults } from "@/data";
import { usePreferences } from "@/state/preferences";
import { ContinueSection } from "@/components/ContinueSection";
import {
  CoverCarousel,
  MOBILE_WIDTH_BREAKPOINT,
} from "@/components/CoverCarousel";
import { Footer } from "@/components/Footer";
import { COLOR, FONT } from "@/theme";

const BADGE_COLOR: Record<SeriesEntry["badge"], string> = {
  both: COLOR.accent,
  "manga-only": COLOR.sideManga,
  "anime-only": COLOR.sideAnime,
};

const BADGE_LABEL: Record<SeriesEntry["badge"], string> = {
  both: "ANIME + MANGA",
  "manga-only": "MANGA",
  "anime-only": "ANIME",
};

const GRID_ITEM_WIDTH = 160;
const GRID_ITEM_HEIGHT = 280;
const GRID_GAP = 16;

const COLUMN_BREAKPOINTS = [
  { minWidth: 2400, columns: 12 },
  { minWidth: 2000, columns: 9 },
  { minWidth: 1700, columns: 8 },
  { minWidth: 1450, columns: 7 },
  { minWidth: 1200, columns: 6 },
  { minWidth: 1000, columns: 5 },
  { minWidth: 800, columns: 4 },
  { minWidth: 0, columns: 3 },
] as const;

const columnsForWidth = (width: number): number =>
  COLUMN_BREAKPOINTS.find((b) => width >= b.minWidth)?.columns ?? 3;

/** Drops "Season 2", "Final Season", "Part II", "Cour 2" and friends from a title. */
export function trimSeasonSuffix(title: string): string {
  const cleaned = title
    .replace(
      /\s*[:\-—–]\s*(?:the\s+)?(?:final\s+)?season(?:\s+[\divxlcm]+)?(?:\s+part\s+[\divxlcm]+)?\s*$/i,
      "",
    )
    .replace(/\s+season\s+[\divxlcm]+\s*$/i, "")
    .replace(/\s+\d+(?:st|nd|rd|th)\s+season\s*$/i, "")
    .replace(/\s+(?:the\s+)?final\s+season\s*$/i, "")
    .replace(/\s+part\s+[\divxlcm]+\s*$/i, "")
    .replace(/\s+(?:\d+(?:st|nd|rd|th)\s+)?cour(?:\s+[\divxlcm]+)?\s*$/i, "")
    .replace(/[:\-—–]\s*$/, "")
    .trim();
  return cleaned || title;
}

export function LatestReleases({
  data,
  loading,
}: {
  data: AniListMedia[];
  loading: boolean;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < MOBILE_WIDTH_BREAKPOINT;
  const [carouselWidth, setCarouselWidth] = useState(0);
  const japanese = usePreferences((s) => s.japanese);

  const onCarouselLayout = (e: LayoutChangeEvent) => {
    setCarouselWidth(e.nativeEvent.layout.width);
  };

  const entries = useMemo(() => pairResults(data), [data]);

  const columns = isMobile ? 0 : columnsForWidth(windowWidth);
  const visible =
    !isMobile && columns > 0
      ? entries.slice(0, Math.floor(entries.length / columns) * columns)
      : entries;

  const renderCard = (entry: SeriesEntry) => (
    <Link
      href={{
        pathname: "/series/[id]",
        params: { id: entry.routeId },
      }}
      asChild
    >
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${entry.primary.title.english ?? entry.primary.title.romaji}`}
        style={({ hovered, pressed }: PressableState) => [
          styles.gridItem,
          { opacity: pressed ? 0.6 : hovered ? 0.9 : 1 },
        ]}
      >
        <View style={styles.gridCoverWrap}>
          <Image
            source={{ uri: entry.primary.coverImage.large }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.gridCover,
              {
                backgroundColor:
                  entry.primary.coverImage.color ?? COLOR.coverPlaceholder,
              },
            ]}
          />
          <View
            style={[
              styles.gridBadge,
              { backgroundColor: BADGE_COLOR[entry.badge] },
            ]}
          >
            <Text style={styles.gridBadgeText}>{BADGE_LABEL[entry.badge]}</Text>
          </View>
        </View>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {trimSeasonSuffix(
            japanese
              ? (entry.primary.title.native ??
                  entry.primary.title.english ??
                  entry.primary.title.romaji)
              : (entry.primary.title.english ?? entry.primary.title.romaji),
          )}
        </Text>
      </Pressable>
    </Link>
  );

  return (
    <ScrollView contentContainerStyle={styles.latestScroll}>
      <ContinueSection />
      <View style={styles.latestHeader}>
        <Text style={styles.latestEyebrow}>Now airing</Text>
        <Text style={styles.latestTitle}>Latest anime</Text>
      </View>
      {loading && entries.length === 0 ? (
        <View style={styles.spinnerWrap}>
          <ActivityIndicator color={COLOR.accent} />
        </View>
      ) : isMobile ? (
        <View onLayout={onCarouselLayout}>
          <CoverCarousel
            items={visible}
            keyExtractor={(entry) => String(entry.routeId)}
            itemWidth={GRID_ITEM_WIDTH}
            itemHeight={GRID_ITEM_HEIGHT}
            containerWidth={carouselWidth}
            renderItem={(entry) => renderCard(entry)}
          />
        </View>
      ) : (
        <View
          style={
            {
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: GRID_GAP,
              alignItems: "flex-start",
            } as unknown as ViewStyle
          }
        >
          {visible.map((entry) => (
            <View key={entry.routeId}>{renderCard(entry)}</View>
          ))}
        </View>
      )}
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  spinnerWrap: { paddingTop: 24 },
  latestScroll: { paddingBottom: 32, gap: 16 },
  latestHeader: { gap: 2 },
  latestEyebrow: {
    color: COLOR.accent,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  latestTitle: {
    color: COLOR.textPrimary,
    fontSize: 22,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  gridItem: {
    gap: 8,
  },
  gridCoverWrap: {
    width: "100%",
    aspectRatio: 160 / 230,
    position: "relative",
  },
  gridCover: {
    width: "100%",
    height: "100%",
  },
  gridBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gridBadgeText: {
    color: COLOR.background,
    fontSize: 9,
    letterSpacing: 1.2,
    fontFamily: FONT.bold,
  },
  gridTitle: {
    color: COLOR.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    height: 36,
    width: "100%",
    overflow: "hidden",
    fontFamily: FONT.semibold,
    letterSpacing: -0.2,
  },
});
