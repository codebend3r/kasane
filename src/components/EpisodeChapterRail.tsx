import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { PressableState, SeriesMapping } from '@/types';
import { FONT } from '@/theme';
import { HoverLabel, useHoverLabel, type MouseLike } from './HoverLabel';

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
  const { containerRef, hover, moveTo, clearHover } = useHoverLabel();

  const goToArc = (arcIdx: number) => {
    router.push({
      pathname: '/series/[id]/arc/[arcIdx]',
      params: { id: seriesId, arcIdx: String(arcIdx) },
    });
  };

  const hasUnadapted = mapping.mappings.some((m) => !m.episodes);
  const maxCoveredChapter = Math.max(
    ...mapping.mappings.map((m) => m.chapters[1])
  );
  const showTail =
    !hasUnadapted &&
    typeof totalChapters === 'number' &&
    totalChapters > maxCoveredChapter;
  const tailSpan = showTail ? totalChapters! - maxCoveredChapter : 0;

  return (
    <View ref={containerRef} style={styles.container}>
      <Text style={styles.label}>Anime episodes →</Text>
      <View style={styles.rail}>
        {mapping.mappings.map((m, idx) => {
          if (!m.episodes) return null;
          const eps = m.episodes;
          const span = eps[1] - eps[0] + 1;
          const label = m.arc ?? `${eps[0]}–${eps[1]}`;
          const color = COLORS[idx % COLORS.length];
          return (
            <Pressable
              key={`ep-${idx}`}
              onPress={() => goToArc(idx)}
              onHoverOut={clearHover}
              // @ts-expect-error react-native-web forwards onMouseMove to the DOM
              onMouseMove={(e: MouseLike) =>
                moveTo({ label, color, textColor: '#000' }, e)
              }
              style={({ hovered, pressed }: PressableState) => [
                styles.bar,
                {
                  flex: span,
                  backgroundColor: color,
                  opacity: pressed ? 0.7 : hovered ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.barText} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Manga chapters →</Text>
      <View style={styles.rail}>
        {mapping.mappings.map((m, idx) => {
          const span = m.chapters[1] - m.chapters[0] + 1;
          const unadapted = !m.episodes;
          const bg = unadapted ? '#2a2a2a' : COLORS[idx % COLORS.length];
          const textStyle = unadapted ? styles.unadaptedBarText : styles.barText;
          const popoverTextColor = unadapted ? '#9aa0a6' : '#000';
          const label = m.arc ?? `${m.chapters[0]}–${m.chapters[1]}`;
          return (
            <Pressable
              key={`ch-${idx}`}
              onPress={() => goToArc(idx)}
              onHoverOut={clearHover}
              // @ts-expect-error react-native-web forwards onMouseMove to the DOM
              onMouseMove={(e: MouseLike) =>
                moveTo({ label, color: bg, textColor: popoverTextColor }, e)
              }
              style={({ hovered, pressed }: PressableState) => [
                styles.bar,
                {
                  flex: span,
                  backgroundColor: bg,
                  opacity: pressed ? 0.7 : hovered ? 0.9 : 1,
                },
              ]}
            >
              <Text style={textStyle} numberOfLines={1}>
                {label}
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

      <HoverLabel hover={hover} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, width: '100%', position: 'relative' },
  label: {
    color: '#9aa0a6',
    fontSize: 12,
    paddingTop: 8,
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
  unadaptedBarText: {
    color: '#9aa0a6',
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.bold,
  },
});
