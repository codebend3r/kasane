import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import type { SeriesBadge, SeriesEntry } from '@/types';
import { FONT } from '@/theme';
import { findMappingByMediaId } from '@/data';

const BADGE_LABEL: Record<SeriesBadge, string> = {
  both: 'ANIME + MANGA',
  'manga-only': 'MANGA ONLY',
  'anime-only': 'ANIME ONLY',
};

const BADGE_COLOR: Record<SeriesBadge, string> = {
  both: '#7c5cff',
  'manga-only': '#ff7c5c',
  'anime-only': '#5cdfff',
};

export function SeriesCard({ entry }: { entry: SeriesEntry }) {
  const { primary, anime, manga, badge, routeId } = entry;
  const title = primary.title.english ?? primary.title.romaji;

  const mapping = findMappingByMediaId(routeId);
  const mappedEpisodeCount = mapping
    ? Math.max(...mapping.mappings.map((m) => m.episodes[1]))
    : null;
  const hasMapping = mapping != null;

  const parts: string[] = [];
  if (anime || badge === 'anime-only') {
    const eps = mappedEpisodeCount ?? anime?.episodes ?? null;
    parts.push(eps ? `${eps} eps` : 'Anime ongoing');
  }
  if (manga || badge === 'manga-only') {
    parts.push(manga?.chapters ? `${manga.chapters} ch` : 'Manga ongoing');
  }
  if (primary.startDate.year) parts.push(String(primary.startDate.year));

  return (
    <Link
      href={{ pathname: '/series/[id]', params: { id: routeId } }}
      asChild
    >
      <Pressable style={styles.card}>
        <Image
          source={{ uri: primary.coverImage.large }}
          style={[
            styles.cover,
            { backgroundColor: primary.coverImage.color ?? '#222' },
          ]}
        />
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.sub}>{parts.join(' · ')}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: BADGE_COLOR[badge] }]}>
            <Text style={styles.badgeText}>{BADGE_LABEL[badge]}</Text>
          </View>
          {hasMapping && (
            <View style={[styles.badge, styles.mappedBadge]}>
              <Text style={styles.badgeText}>MAPPED</Text>
            </View>
          )}
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
  cover: { width: 60, height: 84 },
  meta: { flex: 1, justifyContent: 'center' },
  badges: { alignSelf: 'center', gap: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-end',
  },
  mappedBadge: { backgroundColor: '#5cff9d' },
  badgeText: {
    color: '#0c0c0e',
    fontSize: 10,
    letterSpacing: 1.4,
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
