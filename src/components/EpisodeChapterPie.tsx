import { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { PressableState, SeriesMapping } from '@/types';
import { FONT } from '@/theme';
import {
  HoverLabel,
  hasBoundingRect,
  useHoverLabel,
  type MouseLike,
} from './HoverLabel';

const COLORS = [
  '#7c5cff', '#ff7c5c', '#5cff9d', '#ffd65c',
  '#5cdfff', '#ff5c9d', '#9dff5c', '#ff9d5c',
];

const SIZE = 280;
const RING_RATIO = 0.56;
const HOLE = SIZE * RING_RATIO;

type Slice = {
  arcIdx: number;
  startDeg: number;
  endDeg: number;
  color: string;
  textColor: string;
  label: string;
};

export function EpisodeChapterPie({
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
  const hoverIdxRef = useRef<number | null>(null);

  const { slices, gradientCss, percentAdapted } = useMemo(() => {
    const hasUnadapted = mapping.mappings.some((m) => !m.episodes);
    const maxCoveredChapter = Math.max(
      ...mapping.mappings.map((m) => m.chapters[1])
    );
    const showTail =
      !hasUnadapted &&
      typeof totalChapters === 'number' &&
      totalChapters > maxCoveredChapter;
    const tailSpan = showTail ? totalChapters! - maxCoveredChapter : 0;

    const arcSpans = mapping.mappings.map(
      (m) => m.chapters[1] - m.chapters[0] + 1
    );
    const totalSpan = arcSpans.reduce((acc, n) => acc + n, 0) + tailSpan;

    const { built } = mapping.mappings.reduce<{
      cursor: number;
      built: Slice[];
    }>(
      (acc, m, idx) => {
        const span = arcSpans[idx];
        const startDeg = (acc.cursor / totalSpan) * 360;
        const nextCursor = acc.cursor + span;
        const endDeg = (nextCursor / totalSpan) * 360;
        const unadapted = !m.episodes;
        const slice: Slice = {
          arcIdx: idx,
          startDeg,
          endDeg,
          color: unadapted ? '#2a2a2a' : COLORS[idx % COLORS.length],
          textColor: unadapted ? '#9aa0a6' : '#000',
          label: m.arc ?? `${m.chapters[0]}–${m.chapters[1]}`,
        };
        return { cursor: nextCursor, built: [...acc.built, slice] };
      },
      { cursor: 0, built: [] }
    );

    const tail: Slice[] = showTail
      ? [
          {
            arcIdx: -1,
            startDeg: ((totalSpan - tailSpan) / totalSpan) * 360,
            endDeg: 360,
            color: '#2a2a2a',
            textColor: '#9aa0a6',
            label: `${maxCoveredChapter + 1}–${totalChapters}`,
          },
        ]
      : [];

    const all = [...built, ...tail];
    const css = `conic-gradient(${all
      .map((s) => `${s.color} ${s.startDeg}deg ${s.endDeg}deg`)
      .join(', ')})`;

    const adaptedSpan = mapping.mappings.reduce(
      (acc, m, idx) => (m.episodes ? acc + arcSpans[idx] : acc),
      0
    );
    const percent = Math.round((adaptedSpan / totalSpan) * 100);

    return { slices: all, gradientCss: css, percentAdapted: percent };
  }, [mapping, totalChapters]);

  const sliceFromEvent = (e: MouseLike): Slice | null => {
    const node = containerRef.current;
    if (!hasBoundingRect(node)) return null;
    const rect = node.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.nativeEvent.clientX - cx;
    const dy = e.nativeEvent.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const outer = rect.width / 2;
    const inner = (HOLE / SIZE) * outer;
    if (dist > outer || dist < inner) return null;
    const raw = (Math.atan2(dy, dx) * 180) / Math.PI;
    const angle = (raw + 90 + 360) % 360;
    return (
      slices.find((s) => angle >= s.startDeg && angle < s.endDeg) ?? null
    );
  };

  const onMove = (e: MouseLike) => {
    const slice = sliceFromEvent(e);
    if (!slice) {
      hoverIdxRef.current = null;
      clearHover();
      return;
    }
    hoverIdxRef.current = slice.arcIdx;
    moveTo(
      { label: slice.label, color: slice.color, textColor: slice.textColor },
      e
    );
  };

  const onPress = () => {
    const idx = hoverIdxRef.current;
    if (idx === null || idx < 0) return;
    router.push({
      pathname: '/series/[id]/arc/[arcIdx]',
      params: { id: seriesId, arcIdx: String(idx) },
    });
  };

  return (
    <View style={styles.outer}>
      <Pressable
        ref={containerRef}
        onPress={onPress}
        onHoverOut={() => {
          hoverIdxRef.current = null;
          clearHover();
        }}
        // @ts-expect-error react-native-web forwards onMouseMove to the DOM
        onMouseMove={onMove}
        style={({ hovered }: PressableState) => [
          styles.donut,
          { backgroundImage: gradientCss, opacity: hovered ? 0.96 : 1 },
        ]}
      >
        <View style={styles.hole} pointerEvents="none">
          <Text style={styles.percent}>{percentAdapted}%</Text>
          <Text style={styles.percentLabel}>ADAPTED</Text>
        </View>
        <HoverLabel hover={hover} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  donut: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hole: {
    width: HOLE,
    height: HOLE,
    borderRadius: HOLE,
    backgroundColor: '#0c0c0e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  percent: {
    color: '#f5f5f5',
    fontSize: 44,
    letterSpacing: -2,
    fontFamily: FONT.bold,
    lineHeight: 48,
  },
  percentLabel: {
    color: '#9aa0a6',
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: FONT.semibold,
  },
});
