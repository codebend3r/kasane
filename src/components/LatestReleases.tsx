import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Link } from "expo-router";
import type { AniListMedia, SeriesEntry } from "@/types";
import { displayTitle, englishTitle, trimSeasonSuffix } from "@/data/format";
import { BADGE_SHORT_LABEL, pairResults } from "@/data/pairing";
import { usePreferences } from "@/state/preferences";
import { ContinueSection } from "@/components/ContinueSection";
import { CoverCarousel } from "@/components/CoverCarousel";
import { Footer } from "@/components/Footer";
import { useLayoutWidth } from "@/components/useLayoutWidth";
import { releaseColumns, tileWidthFor } from "@/data/gridLayout";
import { BADGE_COLOR, COLOR, FONT, NARROW_WIDTH, pressFeedback } from "@/theme";

const GRID_ITEM_WIDTH = 160;
const GRID_ITEM_HEIGHT = 280;
const GRID_GAP = 16;

export function LatestReleases({
  data,
  loading,
}: {
  data: AniListMedia[];
  loading: boolean;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < NARROW_WIDTH;
  const [contentWidth, onContentLayout] = useLayoutWidth();
  const japanese = usePreferences((s) => s.japanese);

  const entries = useMemo(() => pairResults(data), [data]);

  // Desktop shows only whole rows, so the grid never ends on a short one.
  const columns = releaseColumns(windowWidth);
  const visible = isMobile
    ? entries
    : entries.slice(0, Math.floor(entries.length / columns) * columns);
  const tileWidth = tileWidthFor({
    available: contentWidth,
    columns,
    gap: GRID_GAP,
  });

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
        accessibilityLabel={englishTitle(entry.primary.title)}
        style={(state) => [styles.gridItem, pressFeedback(state)]}
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
            <Text style={styles.gridBadgeText}>
              {BADGE_SHORT_LABEL[entry.badge]}
            </Text>
          </View>
        </View>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {trimSeasonSuffix(
            displayTitle({ title: entry.primary.title, japanese }),
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
      ) : (
        // Measured rather than read from the window, so a classic scrollbar
        // narrows the tiles instead of wrapping the last one.
        <View onLayout={onContentLayout}>
          {isMobile ? (
            <CoverCarousel
              items={visible}
              keyExtractor={(entry) => String(entry.routeId)}
              itemWidth={GRID_ITEM_WIDTH}
              itemHeight={GRID_ITEM_HEIGHT}
              containerWidth={contentWidth}
              renderItem={(entry) => renderCard(entry)}
            />
          ) : (
            <View style={styles.grid}>
              {tileWidth > 0 &&
                visible.map((entry) => (
                  <View key={entry.routeId} style={{ width: tileWidth }}>
                    {renderCard(entry)}
                  </View>
                ))}
            </View>
          )}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    alignItems: "flex-start",
  },
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
