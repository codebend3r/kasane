import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import type { AniListMedia } from '@/types';
import { FONT } from '@/theme';
import { findMappingByMediaId } from '@/data';

export function SeriesCard({ media }: { media: AniListMedia }) {
  const title = media.title.english ?? media.title.romaji;
  const mapping = findMappingByMediaId(media.id);
  const mappedEpisodeCount = mapping
    ? Math.max(...mapping.mappings.map((m) => m.episodes[1]))
    : null;
  const episodeCount =
    media.type === 'ANIME' ? mappedEpisodeCount ?? media.episodes : null;
  const lengthLabel =
    media.type === 'ANIME'
      ? episodeCount
        ? `${episodeCount} eps`
        : 'Ongoing'
      : media.chapters
        ? `${media.chapters} ch`
        : 'Ongoing';
  const hasMapping = mapping != null;

  return (
    <Link
      href={{
        pathname: media.type === 'MANGA' ? '/manga/[id]' : '/anime/[id]',
        params: { id: media.id },
      }}
      asChild
    >
      <Pressable style={styles.card}>
        <Image
          source={{ uri: media.coverImage.large }}
          style={[styles.cover, { backgroundColor: media.coverImage.color ?? '#222' }]}
        />
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.sub}>
            {media.type} · {lengthLabel}
            {media.startDate.year ? ` · ${media.startDate.year}` : ''}
          </Text>
        </View>
        {hasMapping && (
          <View style={styles.mappedBadge}>
            <Text style={styles.mappedBadgeText}>MAPPED</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a2a',
  },
  cover: { width: 60, height: 84 },
  meta: { flex: 1, justifyContent: 'center' },
  mappedBadge: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#7c5cff',
  },
  mappedBadgeText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: FONT.bold,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 17,
    letterSpacing: -0.3,
    fontFamily: FONT.bold,
  },
  sub: {
    color: '#9aa0a6',
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: FONT.semibold,
  },
});
