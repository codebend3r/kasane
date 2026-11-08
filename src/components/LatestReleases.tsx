import { useEffect, useMemo, type ReactNode } from "react";
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
import type { SeriesEntry } from "@/types";
import { displayTitle, englishTitle, trimSeasonSuffix } from "@/data/format";
import type { SplitFilters } from "@/data/genreFilters";
import { BADGE_SHORT_LABEL, pairResults } from "@/data/pairing";
import { useLatestAnime } from "@/queries/search";
import { usePreferences } from "@/state/preferences";
import { ContinueSection } from "@/components/ContinueSection";
import { CoverCarousel } from "@/components/CoverCarousel";
import { Footer } from "@/components/Footer";
import { useInfiniteScroll } from "@/components/useInfiniteScroll";
import { useIsNarrow } from "@/components/useIsNarrow";
import { useLayoutWidth } from "@/components/useLayoutWidth";
import { releaseColumns, tileWidthFor } from "@/data/gridLayout";
import { uniqueMedia, wholeRows } from "@/data/infiniteScroll";
import { useHomeChrome } from "@/state/homeChrome";
import { BADGE_COLOR, COLOR, FONT, pressFeedback, SPACE } from "@/theme";

const GRID_ITEM_WIDTH = 160;
const GRID_ITEM_HEIGHT = 280;
const GRID_GAP = SPACE.xl;

/**
 * The home screen's "Latest anime" grid, under the reader's in-progress
 * series. `header` sits between the two, so the screen can put its own
 * controls in the same row as the section heading.
 *
 * The grid owns its feed: `useLatestAnime` under `filters`, a page at a time.
 * On wider screens it scrolls without end, asking for the next page as the
 * reader nears the bottom, and scrolling past the top puts the screen in
 * immersive mode, where the header shrinks and the search field hides. The
 * footer is pinned below the scroll area rather than inside it.
 */
export function LatestReleases({
  filters,
  header,
}: {
  filters: SplitFilters;
  header: ReactNode;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = useIsNarrow();
  const [contentWidth, onContentLayout] = useLayoutWidth();
  const japanese = usePreferences((s) => s.japanese);
  const trackOffset = useHomeChrome((s) => s.trackOffset);
  const resetChrome = useHomeChrome((s) => s.reset);
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useLatestAnime({ filters, enabled: true });

  // Leaving the grid (a search, another tab) restores the full header.
  useEffect(() => () => resetChrome(), [resetChrome]);

  // The phone layout is a carousel, so only the grid pages and goes immersive.
  const scroll = useInfiniteScroll({
    enabled: !isMobile,
    onEndReached: () => {
      if (hasNextPage && !isFetching) fetchNextPage();
    },
    onOffsetChange: trackOffset,
  });

  const entries = useMemo(
    () => pairResults(uniqueMedia(data?.pages.map((p) => p.media) ?? [])),
    [data],
  );

  // Desktop shows only whole rows, so the grid never ends on a short one
  // while another page is on its way.
  const columns = releaseColumns(windowWidth);
  const visible = isMobile
    ? entries
    : wholeRows({ items: entries, columns, complete: !hasNextPage });

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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.latestScroll} {...scroll}>
        <ContinueSection />
        {header}
        {isFetching && entries.length === 0 ? (
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
        {isFetchingNextPage && (
          <View style={styles.moreSpinner}>
            <ActivityIndicator color={COLOR.accent} />
          </View>
        )}
      </ScrollView>
      <Footer pinned />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  spinnerWrap: { paddingTop: SPACE.xxxl },
  moreSpinner: { paddingVertical: SPACE.xl },
  latestScroll: { paddingBottom: SPACE.xl, gap: SPACE.xl },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    alignItems: "flex-start",
  },
  gridItem: {
    gap: SPACE.md,
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
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xxs,
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
