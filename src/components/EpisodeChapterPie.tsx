import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import type { PressableState, SeriesMapping } from '@/types';
import { FONT } from '@/theme';
import {
  useProgress,
  useSeriesProgress,
  type ProgressSide,
} from '@/state/progress';
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
  chapterEnd: number;
};

const LONG_PRESS_MS = 320;

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
  onMarked,
}: {
  mapping: SeriesMapping;
  seriesId: string;
  totalChapters?: number | null;
  onMarked?: (side: ProgressSide, position: number) => void;
}) {
  const router = useRouter();
  const { containerRef, hover, moveTo, clearHover } = useHoverLabel();
  const routeId = Number(seriesId);
  const setSide = useProgress((s) => s.setSide);
  const progress = useSeriesProgress(routeId);

  const { slices, percentAdapted, mangaTotal } = useMemo(() => {
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
    const mappingSpan = arcSpans.reduce((acc, n) => acc + n, 0);
    const totalSpan = mappingSpan + tailSpan;

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
          chapterEnd: m.chapters[1],
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
            chapterEnd: totalChapters ?? maxCoveredChapter,
          },
        ]
      : [];

    const all = [...built, ...tail];

    const adaptedSpan = mapping.mappings.reduce(
      (acc, m, idx) => (m.episodes ? acc + arcSpans[idx] : acc),
      0
    );
    const percent = Math.round((adaptedSpan / mappingSpan) * 100);

    return { slices: all, percentAdapted: percent, mangaTotal: totalSpan };
  }, [mapping, totalChapters]);

  const mangaPos = progress?.manga?.position ?? 0;
  const markerDeg =
    mangaTotal > 0 && mangaPos > 0
      ? Math.min((mangaPos / mangaTotal) * 360, 360)
      : 0;
  const showMarker = markerDeg > 0 && markerDeg < 360;
  const [markerOuterX, markerOuterY] = polar(markerDeg, R_OUTER);
  const [markerInnerX, markerInnerY] = polar(markerDeg, R_INNER);

  const markProgress = (side: ProgressSide, position: number) => {
    setSide(routeId, side, position);
    onMarked?.(side, position);
  };

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
    if (!slice) return;
    markProgress('manga', slice.chapterEnd);
  };

  const onLongPress = (e: GestureResponderEvent) => {
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
        onLongPress={onLongPress}
        delayLongPress={LONG_PRESS_MS}
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
          {showMarker && (
            <>
              <Path
                d={annularSectorPath(markerDeg, 360)}
                fill="rgba(12,12,14,0.55)"
              />
              <Line
                x1={markerInnerX}
                y1={markerInnerY}
                x2={markerOuterX}
                y2={markerOuterY}
                stroke="#f5f5f5"
                strokeWidth={0.018}
                strokeLinecap="round"
              />
            </>
          )}
        </Svg>
        <View style={styles.hole} pointerEvents="none">
          <Text style={styles.percent}>{percentAdapted}%</Text>
          <Text style={styles.percentLabel}>ADAPTED</Text>
        </View>
        <HoverLabel hover={hover} />
      </Pressable>
      <Text style={styles.hint}>Tap to mark · Long-press to open arc</Text>
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
  hint: {
    color: '#6b7177',
    fontSize: 11,
    letterSpacing: 1,
    paddingTop: 6,
    textTransform: 'uppercase',
    fontFamily: FONT.semibold,
  },
});
