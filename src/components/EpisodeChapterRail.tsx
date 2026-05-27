import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { SeriesMapping } from '@/types';
import { FONT } from '@/theme';

const COLORS = [
  '#7c5cff', '#ff7c5c', '#5cff9d', '#ffd65c',
  '#5cdfff', '#ff5c9d', '#9dff5c', '#ff9d5c',
];

const BAR_HEIGHT = 44;

export function EpisodeChapterRail({
  mapping,
  seriesId,
  totalChapters,
}: {
  mapping: SeriesMapping;
  seriesId: string;
  totalChapters?: number | null;
}) {
  const router = useRouter();

  const goToArc = (arcIdx: number) => {
    router.push({
      pathname: '/series/[id]/arc/[arcIdx]',
      params: { id: seriesId, arcIdx: String(arcIdx) },
    });
  };

  const maxCoveredChapter = Math.max(
    ...mapping.mappings.map((m) => m.chapters[1])
  );
  const showTail =
    typeof totalChapters === 'number' && totalChapters > maxCoveredChapter;
  const tailSpan = showTail ? totalChapters - maxCoveredChapter : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Anime episodes →</Text>
      <View style={styles.rail}>
        {mapping.mappings.map((m, idx) => {
          const span = m.episodes[1] - m.episodes[0] + 1;
          return (
            <Pressable
              key={`ep-${idx}`}
              onPress={() => goToArc(idx)}
              style={({ hovered, pressed }: any) => [
                styles.bar,
                {
                  flex: span,
                  backgroundColor: COLORS[idx % COLORS.length],
                  opacity: pressed ? 0.7 : hovered ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.barText} numberOfLines={1}>
                {m.arc ?? `${m.episodes[0]}–${m.episodes[1]}`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Manga chapters →</Text>
      <View style={styles.rail}>
        {mapping.mappings.map((m, idx) => {
          const span = m.chapters[1] - m.chapters[0] + 1;
          return (
            <Pressable
              key={`ch-${idx}`}
              onPress={() => goToArc(idx)}
              style={({ hovered, pressed }: any) => [
                styles.bar,
                {
                  flex: span,
                  backgroundColor: COLORS[idx % COLORS.length],
                  opacity: pressed ? 0.7 : hovered ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.barText} numberOfLines={1}>
                {m.chapters[0]}–{m.chapters[1]}
              </Text>
            </Pressable>
          );
        })}
        {showTail && (
          <View style={[styles.bar, styles.tailBar, { flex: tailSpan }]}>
            <Text style={styles.tailBarText} numberOfLines={1}>
              {maxCoveredChapter + 1}–{totalChapters}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, width: '100%' },
  label: {
    color: '#9aa0a6',
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: FONT.semibold,
  },
  rail: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    width: '100%',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  bar: {
    height: BAR_HEIGHT,
    paddingHorizontal: 10,
    justifyContent: 'center',
    minWidth: 0,
  },
  barText: {
    color: '#000',
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.bold,
  },
  tailBar: {
    backgroundColor: '#2a2a2a',
  },
  tailBarText: {
    color: '#9aa0a6',
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.bold,
  },
});
