import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { pairResults } from "@/data/pairing";
import { useCatalog, useGenreFilters } from "@/queries/catalog";
import { useSearch } from "@/queries/search";
import { splitHiddenForAniList } from "@/data/genreFilters";
import { Footer } from "@/components/Footer";
import { SeriesCard } from "@/components/SeriesCard";
import { HomeToolbar } from "@/components/HomeToolbar";
import { LatestReleases } from "@/components/LatestReleases";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { useHomeChrome } from "@/state/homeChrome";
import { usePreferences } from "@/state/preferences";
import { COLOR, FONT, SPACE } from "@/theme";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const hiddenGenres = usePreferences((s) => s.hiddenGenres);
  const genreFilters = useGenreFilters();
  const [mappedOnly, setMappedOnly] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { findMapping } = useCatalog();

  // Chips update `hiddenGenres` immediately so they stay responsive, but the
  // AniList query keys follow this debounced copy. Without it every chip tap
  // fired its own request, and toggling a row of genres tripped AniList's rate
  // limit — the 429s then stuck around as cached query errors, leaving the grid
  // empty even after the genres were switched back on.
  const debouncedHidden = useDebouncedValue(hiddenGenres, 500);
  const filters = splitHiddenForAniList(debouncedHidden, genreFilters);

  const isSearching = debouncedQuery.trim().length > 1;

  const {
    data: searchResults,
    isFetching,
    error,
  } = useSearch({ query: debouncedQuery, filters, enabled: isSearching });

  // Scrolling the latest grid hands the screen over to the covers.
  const immersive = useHomeChrome((s) => s.immersive);

  const pairedResults = useMemo(
    () => pairResults(searchResults ?? []),
    [searchResults],
  );

  // Default to the series kasane actually has an episode<->chapter map for,
  // since those are the ones it can say anything useful about. Unchecking the
  // toggle falls back to everything AniList returned.
  const visibleResults = useMemo(
    () =>
      mappedOnly
        ? pairedResults.filter((e) => !!findMapping(e.routeId))
        : pairedResults,
    [pairedResults, mappedOnly, findMapping],
  );
  const hiddenByMapping = pairedResults.length - visibleResults.length;

  // One toolbar, headed in the latest grid and bare above search results.
  const toolbar = (
    <HomeToolbar
      heading={
        isSearching
          ? undefined
          : { eyebrow: "Now airing", title: "Latest anime" }
      }
      mappedOnly={mappedOnly}
      onMappedOnlyChange={setMappedOnly}
      filtersOpen={filtersOpen}
      onFiltersOpenChange={setFiltersOpen}
    />
  );

  return (
    <View style={styles.root}>
      {!immersive && (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search anime or manga…"
          accessibilityRole="search"
          accessibilityLabel="Search anime or manga"
          placeholderTextColor={COLOR.textFaint}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
        />
      )}

      {error && (
        <Text style={styles.error}>Something went wrong. Try again.</Text>
      )}

      {isSearching ? (
        <>
          {isFetching && (
            <View style={styles.spinnerWrap}>
              <ActivityIndicator color={COLOR.accent} />
            </View>
          )}
          <FlatList
            data={visibleResults}
            keyExtractor={(item) => `series-${item.routeId}`}
            renderItem={({ item }) => <SeriesCard entry={item} />}
            ListHeaderComponent={toolbar}
            ListHeaderComponentStyle={styles.listHeader}
            ListEmptyComponent={
              !isFetching && query === debouncedQuery ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.empty}>
                    {mappedOnly && hiddenByMapping > 0
                      ? `No mapped results. Uncheck “Mapped only” to see ${hiddenByMapping} unmapped ${
                          hiddenByMapping === 1 ? "match" : "matches"
                        }.`
                      : "No results."}
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={Footer}
          />
        </>
      ) : (
        <LatestReleases filters={filters} header={toolbar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACE.xl, gap: SPACE.xl },
  input: {
    backgroundColor: COLOR.surface,
    color: COLOR.textPrimary,
    paddingHorizontal: SPACE.xxxl,
    paddingVertical: SPACE.xxxl,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONT.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.accent,
  },
  spinnerWrap: { paddingTop: SPACE.xxxl },
  listHeader: { paddingBottom: SPACE.xl },
  emptyWrap: { paddingTop: SPACE.page },
  empty: {
    color: COLOR.textMuted,
    textAlign: "center",
    fontFamily: FONT.regular,
  },
  error: {
    color: COLOR.danger,
    textAlign: "center",
    fontFamily: FONT.medium,
  },
});
