import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { searchMedia } from '../src/api/anilist';
import { SeriesCard } from '../src/components/SeriesCard';
import type { MediaType } from '../src/types';

const FILTERS: { label: string; value: MediaType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Anime', value: 'ANIME' },
  { label: 'Manga', value: 'MANGA' },
];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<MediaType | undefined>(undefined);

  const { data, isFetching, error } = useQuery({
    queryKey: ['search', query, type],
    queryFn: () => searchMedia(query, type),
    enabled: query.trim().length > 1,
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

      {isFetching && <ActivityIndicator color="#7c5cff" style={{ marginTop: 24 }} />}
      {error && <Text style={styles.error}>Something went wrong. Try again.</Text>}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => <SeriesCard media={item} />}
        ListEmptyComponent={
          !isFetching && query.length > 1 ? (
            <Text style={styles.empty}>No results.</Text>
          ) : query.length <= 1 ? (
            <Text style={styles.empty}>
              Try “One Piece”, “Attack on Titan”, or “Demon Slayer”.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
  tagline: { color: '#cfd2d6', fontSize: 14, marginBottom: 4 },
  input: {
    backgroundColor: '#17181b',
    color: '#f5f5f5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  filters: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#17181b',
  },
  filterChipActive: { backgroundColor: '#7c5cff' },
  filterText: { color: '#9aa0a6', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#0c0c0e' },
  empty: { color: '#6b7177', textAlign: 'center', marginTop: 32 },
  error: { color: '#ff7c5c', textAlign: 'center', marginTop: 16 },
});
