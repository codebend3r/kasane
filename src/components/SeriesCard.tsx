import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import type { AniListMedia } from '../types';

export function SeriesCard({ media }: { media: AniListMedia }) {
  const title = media.title.english ?? media.title.romaji;
  const lengthLabel =
    media.type === 'ANIME'
      ? media.episodes
        ? `${media.episodes} eps`
        : 'Ongoing'
      : media.chapters
        ? `${media.chapters} ch`
        : 'Ongoing';

  return (
    <Link href={{ pathname: '/series/[id]', params: { id: media.id } }} asChild>
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
  cover: { width: 60, height: 84, borderRadius: 6 },
  meta: { flex: 1, justifyContent: 'center' },
  title: { color: '#f5f5f5', fontSize: 16, fontWeight: '600' },
  sub: { color: '#9aa0a6', fontSize: 13, marginTop: 4 },
});
