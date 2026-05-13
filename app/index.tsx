import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getLatestAnime, searchMedia } from '../src/api/anilist';
import { SeriesCard } from '../src/components/SeriesCard';
import type { AniListMedia, MediaType } from '../src/types';
import { FONT } from '../src/theme';

const FILTERS: { label: string; value: MediaType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Anime', value: 'ANIME' },
  { label: 'Manga', value: 'MANGA' },
];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState<MediaType | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const isSearching = debouncedQuery.trim().length > 1;

  const { data: searchResults, isFetching, error } = useQuery({
    queryKey: ['search', debouncedQuery, type],
    queryFn: () => searchMedia(debouncedQuery, type),
    enabled: isSearching,
  });

  const { data: latestAnime, isFetching: latestFetching } = useQuery({
    queryKey: ['latest-anime'],
    queryFn: getLatestAnime,
    enabled: !isSearching,
    staleTime: 60 * 60 * 1000,
  });

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
          {isFetching && <ActivityIndicator color="#7c5cff" style={{ marginTop: 24 }} />}
          <FlatList
            data={searchResults ?? []}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => <SeriesCard media={item} />}
            ListEmptyComponent={
              !isFetching && query === debouncedQuery ? (
                <Text style={styles.empty}>No results.</Text>
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

function LatestReleases({
  data,
  loading,
}: {
  data: AniListMedia[];
  loading: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.latestScroll}>
      <View style={styles.latestHeader}>
        <Text style={styles.latestEyebrow}>Now airing</Text>
        <Text style={styles.latestTitle}>Latest anime</Text>
      </View>
      {loading && data.length === 0 ? (
        <ActivityIndicator color="#7c5cff" style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.grid}>
          {data.map((media) => (
            <Link
              key={media.id}
              href={{ pathname: '/series/[id]', params: { id: media.id } }}
              asChild
            >
              <Pressable
                style={({ hovered, pressed }: any) => [
                  styles.gridItem,
                  { opacity: pressed ? 0.6 : hovered ? 0.9 : 1 },
                ]}
              >
                <Image
                  source={{ uri: media.coverImage.large }}
                  style={[
                    styles.gridCover,
                    { backgroundColor: media.coverImage.color ?? '#222' },
                  ]}
                />
                <Text style={styles.gridTitle} numberOfLines={2}>
                  {trimSeasonSuffix(media.title.english ?? media.title.romaji)}
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
    marginBottom: 8,
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
    marginVertical: 8,
  },
  filters: { flexDirection: 'row', gap: 8 },
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
  empty: { color: '#6b7177', textAlign: 'center', marginTop: 32, fontFamily: FONT.regular },
  error: { color: '#ff7c5c', textAlign: 'center', marginTop: 16, fontFamily: FONT.medium },
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
  gridCover: {
    width: 160,
    height: 230,
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
