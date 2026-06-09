import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  type LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getLatestAnime, searchMedia } from "@/api/anilist";
import { pairResults } from "@/data";
import { GENRE_FILTERS, splitHiddenForAniList } from "@/data/genreFilters";
import { SeriesCard } from "@/components/SeriesCard";
import { ContinueSection } from "@/components/ContinueSection";
import {
  CoverCarousel,
  MOBILE_WIDTH_BREAKPOINT,
} from "@/components/CoverCarousel";
import { Footer } from "@/components/Footer";
import { usePreferences } from "@/state/preferences";
import type { AniListMedia, SeriesEntry } from "@/types";
import { FONT } from "@/theme";

const BADGE_COLOR: Record<SeriesEntry["badge"], string> = {
  both: "#7c5cff",
  "manga-only": "#ff7c5c",
  "anime-only": "#5cdfff",
};

const BADGE_LABEL: Record<SeriesEntry["badge"], string> = {
  both: "ANIME + MANGA",
  "manga-only": "MANGA",
  "anime-only": "ANIME",
};

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hiddenGenres = usePreferences((s) => s.hiddenGenres);
  const toggleHiddenGenre = usePreferences((s) => s.toggleHiddenGenre);
  const { genreNotIn, tagNotIn } = splitHiddenForAniList(hiddenGenres);
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < MOBILE_WIDTH_BREAKPOINT;
  const hiddenCount = hiddenGenres.length;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const isSearching = debouncedQuery.trim().length > 1;

  const {
    data: searchResults,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["search", debouncedQuery, genreNotIn, tagNotIn],
    queryFn: () => searchMedia(debouncedQuery, undefined, genreNotIn, tagNotIn),
    enabled: isSearching,
  });

  const { data: latestAnime, isFetching: latestFetching } = useQuery({
    queryKey: ["latest-anime", genreNotIn, tagNotIn],
    queryFn: () => getLatestAnime(genreNotIn, tagNotIn),
    enabled: !isSearching,
    staleTime: 60 * 60 * 1000,
  });

  const pairedResults = useMemo(
    () => pairResults(searchResults ?? []),
    [searchResults],
  );

  return (
    <View style={styles.root}>
      <Text style={styles.tagline}>
        Find which anime episodes cover which manga chapters.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search anime or manga…"
        placeholderTextColor="#6b7177"
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
      />

      <Pressable
        onPress={() => setFiltersOpen((o) => !o)}
        style={({ hovered, pressed }: any) => [
          styles.filterToggle,
          { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.filterToggleText}>
          {hiddenCount > 0
            ? `Filter genres · ${hiddenCount} hidden`
            : "Filter genres"}
        </Text>
        <Text style={styles.filterToggleChevron}>
          {filtersOpen && !isMobile ? "▴" : "▾"}
        </Text>
      </Pressable>

      {!isMobile && filtersOpen && (
        <View style={styles.genreFilters}>
          {GENRE_FILTERS.map((f) => {
            const included = !hiddenGenres.includes(f.id);
            return (
              <Pressable
                key={f.id}
                onPress={() => toggleHiddenGenre(f.id)}
                style={[styles.filterChip, included && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterText,
                    included && styles.filterTextActive,
                  ]}
                >
                  {included ? f.label : `× ${f.label}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {isMobile && (
        <GenreFilterSheet
          visible={filtersOpen}
          hiddenGenres={hiddenGenres}
          onToggle={toggleHiddenGenre}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      {error && (
        <Text style={styles.error}>Something went wrong. Try again.</Text>
      )}

      {isSearching ? (
        <>
          {isFetching && (
            <View style={styles.spinnerWrap}>
              <ActivityIndicator color="#7c5cff" />
            </View>
          )}
          <FlatList
            data={pairedResults}
            keyExtractor={(item) => `series-${item.routeId}`}
            renderItem={({ item }) => <SeriesCard entry={item} />}
            ListEmptyComponent={
              !isFetching && query === debouncedQuery ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.empty}>No results.</Text>
                </View>
              ) : null
            }
            ListFooterComponent={Footer}
          />
        </>
      ) : (
        <LatestReleases data={latestAnime ?? []} loading={latestFetching} />
      )}
    </View>
  );
}

function GenreFilterSheet({
  visible,
  hiddenGenres,
  onToggle,
  onClose,
}: {
  visible: boolean;
  hiddenGenres: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.sheetBackdropFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter genres</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }: any) => [
                styles.sheetDone,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.sheetDoneText}>Done</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
          >
            {GENRE_FILTERS.map((f) => {
              const included = !hiddenGenres.includes(f.id);
              return (
                <Pressable
                  key={f.id}
                  onPress={() => onToggle(f.id)}
                  style={({ pressed }: any) => [
                    styles.sheetRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View
                    style={[
                      styles.sheetCheckbox,
                      included && styles.sheetCheckboxOn,
                    ]}
                  >
                    {included && <Text style={styles.sheetCheckMark}>✓</Text>}
                  </View>
                  <Text style={styles.sheetRowLabel}>{f.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function trimSeasonSuffix(title: string): string {
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

function LatestReleases({
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
        style={({ hovered, pressed }: any) => [
          styles.gridItem,
          { opacity: pressed ? 0.6 : hovered ? 0.9 : 1 },
        ]}
      >
        <View style={styles.gridCoverWrap}>
          <Image
            source={{ uri: entry.primary.coverImage.large }}
            style={[
              styles.gridCover,
              {
                backgroundColor: entry.primary.coverImage.color ?? "#222",
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
          <ActivityIndicator color="#7c5cff" />
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
  root: { flex: 1, padding: 16, gap: 16 },
  tagline: {
    color: "#cfd2d6",
    fontSize: 16,
    letterSpacing: -0.2,
    fontFamily: FONT.medium,
  },
  input: {
    backgroundColor: "#17181b",
    color: "#f5f5f5",
    paddingHorizontal: 24,
    paddingVertical: 24,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONT.medium,
    borderLeftWidth: 4,
    borderLeftColor: "#7c5cff",
  },
  genreFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    rowGap: 8,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#17181b",
    borderLeftWidth: 2,
    borderLeftColor: "#7c5cff",
  },
  filterToggleText: {
    color: "#cfd2d6",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  filterToggleChevron: {
    color: "#7c5cff",
    fontSize: 12,
    lineHeight: 12,
    fontFamily: FONT.bold,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheetBackdropFill: { flex: 1 },
  sheet: {
    backgroundColor: "#17181b",
    maxHeight: "75%",
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    backgroundColor: "#2a2c30",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  sheetTitle: {
    flex: 1,
    color: "#f5f5f5",
    fontSize: 18,
    fontFamily: FONT.bold,
    letterSpacing: -0.2,
  },
  sheetDone: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#7c5cff",
  },
  sheetDoneText: {
    color: "#0c0c0e",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  sheetScroll: { paddingHorizontal: 20 },
  sheetScrollContent: { paddingBottom: 12, gap: 4 },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  sheetCheckbox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0c0c0e",
    borderWidth: 2,
    borderColor: "#2a2c30",
  },
  sheetCheckboxOn: {
    backgroundColor: "#7c5cff",
    borderColor: "#7c5cff",
  },
  sheetCheckMark: {
    color: "#0c0c0e",
    fontSize: 14,
    lineHeight: 14,
    fontFamily: FONT.bold,
  },
  sheetRowLabel: {
    color: "#f5f5f5",
    fontSize: 16,
    fontFamily: FONT.medium,
    letterSpacing: -0.1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#17181b",
  },
  filterChipActive: { backgroundColor: "#7c5cff" },
  filterText: {
    color: "#9aa0a6",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  filterTextActive: { color: "#0c0c0e" },
  spinnerWrap: { paddingTop: 24 },
  emptyWrap: { paddingTop: 32 },
  empty: { color: "#6b7177", textAlign: "center", fontFamily: FONT.regular },
  error: { color: "#ff7c5c", textAlign: "center", fontFamily: FONT.medium },
  latestScroll: { paddingBottom: 32, gap: 16 },
  latestHeader: { gap: 2 },
  latestEyebrow: {
    color: "#7c5cff",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  latestTitle: {
    color: "#f5f5f5",
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
    color: "#0c0c0e",
    fontSize: 9,
    letterSpacing: 1.2,
    fontFamily: FONT.bold,
  },
  gridTitle: {
    color: "#f5f5f5",
    fontSize: 14,
    lineHeight: 18,
    height: 36,
    width: "100%",
    overflow: "hidden",
    fontFamily: FONT.semibold,
    letterSpacing: -0.2,
  },
});
