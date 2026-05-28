import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getLatestAnime, searchMedia } from '@/api/anilist';
import { pairResults } from '@/data';
import { GENRE_FILTERS, splitHiddenForAniList } from '@/data/genreFilters';
import { SeriesCard } from '@/components/SeriesCard';
import { usePreferences } from '@/state/preferences';
import type { AniListMedia, MediaType, SeriesEntry } from '@/types';
import { FONT } from '@/theme';

const BADGE_COLOR: Record<SeriesEntry['badge'], string> = {
  both: '#7c5cff',
  'manga-only': '#ff7c5c',
  'anime-only': '#5cdfff',
};

const BADGE_LABEL: Record<SeriesEntry['badge'], string> = {
  both: 'ANIME + MANGA',
  'manga-only': 'MANGA',
  'anime-only': 'ANIME',
};

const FILTERS: { label: string; value: MediaType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Anime', value: 'ANIME' },
  { label: 'Manga', value: 'MANGA' },
];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState<MediaType | undefined>(undefined);
  const hiddenGenres = usePreferences((s) => s.hiddenGenres);
  const toggleHiddenGenre = usePreferences((s) => s.toggleHiddenGenre);
  const { genreNotIn, tagNotIn } = splitHiddenForAniList(hiddenGenres);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const isSearching = debouncedQuery.trim().length > 1;

  const { data: searchResults, isFetching, error } = useQuery({
    queryKey: ['search', debouncedQuery, type, genreNotIn, tagNotIn],
    queryFn: () => searchMedia(debouncedQuery, type, genreNotIn, tagNotIn),
    enabled: isSearching,
  });

  const { data: latestAnime, isFetching: latestFetching } = useQuery({
    queryKey: ['latest-anime', genreNotIn, tagNotIn],
    queryFn: () => getLatestAnime(genreNotIn, tagNotIn),
    enabled: !isSearching,
    staleTime: 60 * 60 * 1000,
  });

  const pairedResults = useMemo(
    () => pairResults(searchResults ?? []),
    [searchResults]
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
                style={[styles.filterText, included && styles.filterTextActive]}
              >
                {included ? f.label : `× ${f.label}`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isSearching && (
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.label}
              onPress={() => setType(f.value)}
              style={[styles.filterChip, type === f.value && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, type === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {error && <Text style={styles.error}>Something went wrong. Try again.</Text>}

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
          />
        </>
      ) : (
        <LatestReleases data={latestAnime ?? []} loading={latestFetching} />
      )}
    </View>
  );
}

function trimSeasonSuffix(title: string): string {
  const cleaned = title
    .replace(
      /\s*[:\-—–]\s*(?:the\s+)?(?:final\s+)?season(?:\s+[\divxlcm]+)?(?:\s+part\s+[\divxlcm]+)?\s*$/i,
      ''
    )
    .replace(/\s+season\s+[\divxlcm]+\s*$/i, '')
    .replace(/\s+\d+(?:st|nd|rd|th)\s+season\s*$/i, '')
    .replace(/\s+(?:the\s+)?final\s+season\s*$/i, '')
    .replace(/\s+part\s+[\divxlcm]+\s*$/i, '')
    .replace(/\s+(?:\d+(?:st|nd|rd|th)\s+)?cour(?:\s+[\divxlcm]+)?\s*$/i, '')
    .replace(/[:\-—–]\s*$/, '')
    .trim();
  return cleaned || title;
}

const GRID_ITEM_WIDTH = 160;
const GRID_GAP = 16;

function LatestReleases({
  data,
  loading,
}: {
  data: AniListMedia[];
  loading: boolean;
}) {
  const [gridWidth, setGridWidth] = useState(0);
  const japanese = usePreferences((s) => s.japanese);

  const onGridLayout = (e: LayoutChangeEvent) => {
    setGridWidth(e.nativeEvent.layout.width);
  };

  const entries = useMemo(() => pairResults(data), [data]);

  const columns =
    gridWidth > 0
      ? Math.max(1, Math.floor((gridWidth + GRID_GAP) / (GRID_ITEM_WIDTH + GRID_GAP)))
      : 0;
  const visible =
    columns > 0
      ? entries.slice(0, Math.floor(entries.length / columns) * columns)
      : [];

  return (
    <ScrollView contentContainerStyle={styles.latestScroll}>
      <View style={styles.latestHeader}>
        <Text style={styles.latestEyebrow}>Now airing</Text>
        <Text style={styles.latestTitle}>Latest anime</Text>
      </View>
      {loading && entries.length === 0 ? (
        <View style={styles.spinnerWrap}>
          <ActivityIndicator color="#7c5cff" />
        </View>
      ) : (
        <View style={styles.grid} onLayout={onGridLayout}>
          {visible.map((entry) => (
            <Link
              key={entry.routeId}
              href={{
                pathname: '/series/[id]',
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
                        backgroundColor:
                          entry.primary.coverImage.color ?? '#222',
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
                      {BADGE_LABEL[entry.badge]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.gridTitle} numberOfLines={2}>
                  {trimSeasonSuffix(
                    japanese
                      ? entry.primary.title.native ??
                          entry.primary.title.english ??
                          entry.primary.title.romaji
                      : entry.primary.title.english ?? entry.primary.title.romaji
                  )}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 16 },
  tagline: {
    color: '#cfd2d6',
    fontSize: 16,
    letterSpacing: -0.2,
    fontFamily: FONT.medium,
  },
  input: {
    backgroundColor: '#17181b',
    color: '#f5f5f5',
    paddingHorizontal: 24,
    paddingVertical: 24,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONT.medium,
    borderLeftWidth: 4,
    borderLeftColor: '#7c5cff',
  },
  filters: { flexDirection: 'row', gap: 8 },
  genreFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#17181b',
  },
  filterChipActive: { backgroundColor: '#7c5cff' },
  filterText: {
    color: '#9aa0a6',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
  },
  filterTextActive: { color: '#0c0c0e' },
  spinnerWrap: { paddingTop: 24 },
  emptyWrap: { paddingTop: 32 },
  empty: { color: '#6b7177', textAlign: 'center', fontFamily: FONT.regular },
  error: { color: '#ff7c5c', textAlign: 'center', fontFamily: FONT.medium },
  latestScroll: { paddingBottom: 32, gap: 16 },
  latestHeader: { gap: 2 },
  latestEyebrow: {
    color: '#7c5cff',
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
  },
  latestTitle: {
    color: '#f5f5f5',
    fontSize: 22,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'flex-start',
  },
  gridItem: {
    width: 160,
    height: 280,
    gap: 8,
  },
  gridCoverWrap: {
    width: 160,
    height: 230,
    position: 'relative',
  },
  gridCover: {
    width: 160,
    height: 230,
  },
  gridBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gridBadgeText: {
    color: '#0c0c0e',
    fontSize: 9,
    letterSpacing: 1.2,
    fontFamily: FONT.bold,
  },
  gridTitle: {
    color: '#f5f5f5',
    fontSize: 14,
    lineHeight: 18,
    height: 36,
    width: 160,
    overflow: 'hidden',
    fontFamily: FONT.semibold,
    letterSpacing: -0.2,
  },
});
