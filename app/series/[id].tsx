import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMedia } from '../../src/api/anilist';
import {
  chapterToEpisodes,
  episodeToChapters,
  findMappingByMediaId,
} from '../../src/data';
import { EpisodeChapterRail } from '../../src/components/EpisodeChapterRail';

export default function SeriesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !Number.isNaN(mediaId),
  });

  const mapping = useMemo(() => findMappingByMediaId(mediaId), [mediaId]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c5cff" />
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Could not load series.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image source={{ uri: media.coverImage.large }} style={styles.cover} />
        <View style={styles.headerMeta}>
          <Text style={styles.title}>
            {media.title.english ?? media.title.romaji}
          </Text>
          <Text style={styles.sub}>
            {media.type} ·{' '}
            {media.type === 'ANIME'
              ? `${media.episodes ?? '?'} eps`
              : `${media.chapters ?? '?'} ch · ${media.volumes ?? '?'} vol`}
            {media.startDate.year ? ` · ${media.startDate.year}` : ''}
          </Text>
          {media.description && (
            <Text style={styles.description} numberOfLines={6}>
              {media.description.replace(/<[^>]+>/g, '')}
            </Text>
          )}
        </View>
      </View>

      {mapping ? (
        <>
          <Text style={styles.sectionTitle}>Episode ↔ Chapter map</Text>
          <EpisodeChapterRail mapping={mapping} />
          <QuickLookup mapping={mapping} />
        </>
      ) : (
        <View style={styles.noMapping}>
          <Text style={styles.noMappingTitle}>No mapping available yet</Text>
          <Text style={styles.noMappingBody}>
            We haven&apos;t curated a chapter/episode mapping for this series. Contributions
            are welcome — add a JSON file to{' '}
            <Text style={styles.code}>src/data/mappings/</Text> in the repo.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function QuickLookup({ mapping }: { mapping: ReturnType<typeof findMappingByMediaId> }) {
  const [epInput, setEpInput] = useState('');
  const [chInput, setChInput] = useState('');

  if (!mapping) return null;

  const epNum = Number(epInput);
  const chNum = Number(chInput);
  const fromEp = !Number.isNaN(epNum) && epNum > 0 ? episodeToChapters(mapping, epNum) : null;
  const fromCh = !Number.isNaN(chNum) && chNum > 0 ? chapterToEpisodes(mapping, chNum) : null;

  return (
    <View style={styles.lookup}>
      <Text style={styles.sectionTitle}>Quick lookup</Text>
      <View style={styles.lookupRow}>
        <Text style={styles.lookupLabel}>I finished episode</Text>
        <TextInput
          value={epInput}
          onChangeText={setEpInput}
          keyboardType="number-pad"
          style={styles.lookupInput}
          placeholder="e.g. 12"
          placeholderTextColor="#6b7177"
        />
        <Text style={styles.lookupResult}>
          → {fromEp ? `chapters ${fromEp[0]}–${fromEp[1]}` : '—'}
        </Text>
      </View>
      <View style={styles.lookupRow}>
        <Text style={styles.lookupLabel}>I finished chapter</Text>
        <TextInput
          value={chInput}
          onChangeText={setChInput}
          keyboardType="number-pad"
          style={styles.lookupInput}
          placeholder="e.g. 50"
          placeholderTextColor="#6b7177"
        />
        <Text style={styles.lookupResult}>
          → {fromCh ? `episodes ${fromCh[0]}–${fromCh[1]}` : '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', gap: 16 },
  cover: { width: 110, height: 154, borderRadius: 8, backgroundColor: '#222' },
  headerMeta: { flex: 1, gap: 6 },
  title: { color: '#f5f5f5', fontSize: 20, fontWeight: '700' },
  sub: { color: '#9aa0a6', fontSize: 13 },
  description: { color: '#cfd2d6', fontSize: 13, lineHeight: 19, marginTop: 6 },
  sectionTitle: { color: '#f5f5f5', fontSize: 16, fontWeight: '600', marginTop: 10 },
  empty: { color: '#9aa0a6' },
  noMapping: {
    padding: 16,
    backgroundColor: '#17181b',
    borderRadius: 10,
    gap: 6,
  },
  noMappingTitle: { color: '#ffd65c', fontWeight: '600' },
  noMappingBody: { color: '#cfd2d6', fontSize: 13, lineHeight: 18 },
  code: { fontFamily: 'Menlo', color: '#7c5cff' },
  lookup: { gap: 12, marginTop: 8 },
  lookupRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  lookupLabel: { color: '#cfd2d6', fontSize: 13 },
  lookupInput: {
    backgroundColor: '#17181b',
    color: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  lookupResult: { color: '#7c5cff', fontSize: 13, fontWeight: '600' },
});
