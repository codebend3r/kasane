import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
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
const R_OUTER = 1;
const R_INNER = RING_RATIO;

type Slice = {
  arcIdx: number;
  startDeg: number;
  endDeg: number;
  color: string;
  textColor: string;
  label: string;
};

const polar = (deg: number, r: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
};

const annularSectorPath = (startDeg: number, endDeg: number): string => {
  const [x1o, y1o] = polar(startDeg, R_OUTER);
  const [x2o, y2o] = polar(endDeg, R_OUTER);
  const [x1i, y1i] = polar(startDeg, R_INNER);
  const [x2i, y2i] = polar(endDeg, R_INNER);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1o} ${y1o}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${x2o} ${y2o}`,
    `L ${x2i} ${y2i}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${x1i} ${y1i}`,
    'Z',
  ].join(' ');
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

  const { slices, percentAdapted } = useMemo(() => {
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

    const adaptedSpan = mapping.mappings.reduce(
      (acc, m, idx) => (m.episodes ? acc + arcSpans[idx] : acc),
      0
    );
    const percent = Math.round((adaptedSpan / totalSpan) * 100);

    return { slices: all, percentAdapted: percent };
  }, [mapping, totalChapters]);

  const sliceFromLocal = (
    x: number,
    y: number,
    boxSize: number
  ): Slice | null => {
    const dx = x - boxSize / 2;
    const dy = y - boxSize / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const outer = boxSize / 2;
    const inner = (HOLE / SIZE) * outer;
    if (dist > outer || dist < inner) return null;
    const raw = (Math.atan2(dy, dx) * 180) / Math.PI;
    const angle = (raw + 90 + 360) % 360;
    return slices.find((s) => angle >= s.startDeg && angle < s.endDeg) ?? null;
  };

  const onPress = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const slice = sliceFromLocal(locationX, locationY, SIZE);
    if (!slice || slice.arcIdx < 0) return;
    router.push({
      pathname: '/series/[id]/arc/[arcIdx]',
      params: { id: seriesId, arcIdx: String(slice.arcIdx) },
    });
  };

  const onMouseMove = (e: MouseLike) => {
    const node = containerRef.current;
    if (!hasBoundingRect(node)) return;
    const rect = node.getBoundingClientRect();
    const slice = sliceFromLocal(
      e.nativeEvent.clientX - rect.left,
      e.nativeEvent.clientY - rect.top,
      rect.width
    );
    if (!slice) {
      clearHover();
      return;
    }
    moveTo(
      { label: slice.label, color: slice.color, textColor: slice.textColor },
      e
    );
  };

  const fullCircle = slices.length === 1;

  return (
    <View style={styles.outer}>
      <Pressable
        ref={containerRef}
        onPress={onPress}
        onHoverOut={clearHover}
        // @ts-expect-error react-native-web forwards onMouseMove to the DOM
        onMouseMove={onMouseMove}
        style={({ hovered }: PressableState) => [
          styles.donut,
          { opacity: hovered ? 0.96 : 1 },
        ]}
      >
        <Svg width={SIZE} height={SIZE} viewBox="-1 -1 2 2">
          {fullCircle ? (
            <Circle
              cx={0}
              cy={0}
              r={(R_OUTER + R_INNER) / 2}
              fill="none"
              stroke={slices[0].color}
              strokeWidth={R_OUTER - R_INNER}
            />
          ) : (
            slices.map((s) => (
              <Path
                key={`${s.arcIdx}-${s.startDeg}`}
                d={annularSectorPath(s.startDeg, s.endDeg)}
                fill={s.color}
              />
            ))
          )}
        </Svg>
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hole: {
    position: 'absolute',
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
