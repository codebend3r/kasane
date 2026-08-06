import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getLatestAnime, searchMedia } from "@/api/anilist";
import { pairResults } from "@/data";
import { useCatalog, useGenreFilters } from "@/data/catalog";
import { splitHiddenForAniList } from "@/data/genreFilters";
import { Footer } from "@/components/Footer";
import { SeriesCard } from "@/components/SeriesCard";
import { GenreFilters } from "@/components/GenreFilters";
import { LatestReleases } from "@/components/LatestReleases";
import { MappedOnlyToggle } from "@/components/MappedOnlyToggle";
import { MOBILE_WIDTH_BREAKPOINT } from "@/components/CoverCarousel";
import { usePreferences } from "@/state/preferences";
import { COLOR, FONT } from "@/theme";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hiddenGenres = usePreferences((s) => s.hiddenGenres);
  const toggleHiddenGenre = usePreferences((s) => s.toggleHiddenGenre);
  const setHiddenGenres = usePreferences((s) => s.setHiddenGenres);
  const genreFilters = useGenreFilters();
  const [mappedOnly, setMappedOnly] = useState(true);
  const { findMapping } = useCatalog();

  // Chips update `hiddenGenres` immediately so they stay responsive, but the
  // AniList query keys follow this debounced copy. Without it every chip tap
  // fired its own request, and toggling a row of genres tripped AniList's rate
  // limit — the 429s then stuck around as cached query errors, leaving the grid
  // empty even after the genres were switched back on.
  const [debouncedHidden, setDebouncedHidden] = useState(hiddenGenres);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedHidden(hiddenGenres), 500);
    return () => clearTimeout(t);
  }, [hiddenGenres]);

  const { genreNotIn, tagNotIn } = splitHiddenForAniList(
    debouncedHidden,
    genreFilters,
  );
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < MOBILE_WIDTH_BREAKPOINT;

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

  return (
    <View style={styles.root}>
      <Text style={styles.tagline}>
        Find which anime episodes cover which manga chapters.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search anime or manga…"
        accessibilityLabel="Search anime or manga"
        placeholderTextColor={COLOR.textFaint}
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
      />

      <MappedOnlyToggle value={mappedOnly} onChange={setMappedOnly} />

      <GenreFilters
        filters={genreFilters}
        hiddenGenres={hiddenGenres}
        onToggle={toggleHiddenGenre}
        onSetHidden={setHiddenGenres}
        isMobile={isMobile}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      />

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
        <LatestReleases data={latestAnime ?? []} loading={latestFetching} />
      )}
    </View>
  );
}

/**
 * One-tap "show everything / hide everything" for the genre chips. Writes the
 * whole selection at once, which also keeps a bulk change from fanning out into
 * one AniList request per genre.
 */
const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 16 },
  tagline: {
    color: COLOR.textSecondary,
    fontSize: 16,
    letterSpacing: -0.2,
    fontFamily: FONT.medium,
  },
  input: {
    backgroundColor: COLOR.surface,
    color: COLOR.textPrimary,
    paddingHorizontal: 24,
    paddingVertical: 24,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONT.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.accent,
  },
  spinnerWrap: { paddingTop: 24 },
  emptyWrap: { paddingTop: 32 },
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
