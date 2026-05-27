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
import { getMedia } from '@/api/anilist';
import {
  buildSyntheticMapping,
  chapterToEpisodes,
  episodeToChapters,
  findMappingByMediaId,
} from '@/data';
import { EpisodeChapterRail } from '@/components/EpisodeChapterRail';
import { formatAniListDate } from '@/data/format';
import { FONT } from '@/theme';

export default function AnimeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !Number.isNaN(mediaId),
  });

  const curatedMapping = useMemo(() => findMappingByMediaId(mediaId), [mediaId]);
  const syntheticMapping = useMemo(
    () => (media && !curatedMapping ? buildSyntheticMapping(media) : null),
    [media, curatedMapping]
  );
  const mapping = curatedMapping ?? syntheticMapping;
  const isAutoEstimated = !curatedMapping && !!syntheticMapping;

  const mappedEpisodeCount = mapping
    ? Math.max(...mapping.mappings.map((m) => m.episodes[1]))
    : null;

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
        <Text style={styles.empty}>Could not load anime.</Text>
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
            ANIME · {mappedEpisodeCount ?? media.episodes ?? '?'} eps
            {media.format ? ` · ${media.format}` : ''}
            {media.startDate.year ? ` · ${formatAniListDate(media.startDate)}` : ''}
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
          {isAutoEstimated && (
            <View style={styles.autoBanner}>
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>AUTO-ESTIMATED</Text>
              </View>
              <Text style={styles.autoBannerBody}>
                Linear pacing — anime episode count distributed evenly across the
                manga chapter count. Real arcs rarely adapt at a uniform rate, so
                treat numbers as a rough guide. Curated JSON in{' '}
                <Text style={styles.code}>src/data/mappings/</Text> overrides this.
              </Text>
            </View>
          )}
          <EpisodeChapterRail mapping={mapping} seriesId={String(mediaId)} routePrefix="anime" />
          <QuickLookup mapping={mapping} />
        </>
      ) : (
        <View style={styles.noMapping}>
          <Text style={styles.noMappingTitle}>No mapping available yet</Text>
          <Text style={styles.noMappingBody}>
            We couldn&apos;t find an anime↔manga adaptation pair on AniList for this
            entry, and no curated mapping exists. Add a JSON file to{' '}
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
  cover: { width: 110, height: 154, backgroundColor: '#222' },
  headerMeta: { flex: 1, gap: 6 },
  title: {
    color: '#f5f5f5',
    fontSize: 28,
    letterSpacing: -0.8,
    fontFamily: FONT.bold,
  },
  sub: {
    color: '#9aa0a6',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: FONT.semibold,
  },
  description: {
    color: '#cfd2d6',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    fontFamily: FONT.regular,
  },
  sectionTitle: {
    color: '#f5f5f5',
    fontSize: 18,
    marginTop: 10,
    letterSpacing: -0.3,
    fontFamily: FONT.bold,
  },
  empty: { color: '#9aa0a6', fontFamily: FONT.regular },
  autoBanner: {
    padding: 14,
    backgroundColor: '#1f1a2e',
    borderLeftWidth: 4,
    borderLeftColor: '#ffd65c',
    gap: 8,
  },
  autoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#ffd65c',
  },
  autoBadgeText: {
    color: '#0c0c0e',
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONT.bold,
  },
  autoBannerBody: {
    color: '#cfd2d6',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT.regular,
  },
  noMapping: {
    padding: 16,
    backgroundColor: '#17181b',
    gap: 6,
  },
  noMappingTitle: { color: '#ffd65c', fontFamily: FONT.bold },
  noMappingBody: { color: '#cfd2d6', fontSize: 13, lineHeight: 18, fontFamily: FONT.regular },
  code: { fontFamily: 'Menlo', color: '#7c5cff' },
  lookup: { gap: 12, marginTop: 8 },
  lookupRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  lookupLabel: { color: '#cfd2d6', fontSize: 13, fontFamily: FONT.medium },
  lookupInput: {
    backgroundColor: '#17181b',
    color: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 80,
    fontFamily: FONT.regular,
  },
  lookupResult: { color: '#7c5cff', fontSize: 13, fontFamily: FONT.bold },
});
