import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { MovieEntry, PressableState, SeriesMapping } from "@/types";
import { ARC_COLORS, COLOR, FONT, MOVIE_COLOR } from "@/theme";
import {
  useProgress,
  useSeriesProgress,
  type ProgressSide,
} from "@/state/progress";
import { HoverLabel, useHoverLabel, type MouseLike } from "./HoverLabel";

const BAR_HEIGHT = 44;
const LONG_PRESS_MS = 320;

// The rail is pure colour and geometry, so a screen reader needs the same
// facts in words. Label the group; the arc detail route carries the per-arc
// breakdown, so individual bars stay out of the accessibility tree.
const arcName = (arc: string | undefined, from: number, to: number): string =>
  arc ?? `${from} to ${to}`;

const episodeSummary = (mapping: SeriesMapping): string => {
  const parts = mapping.mappings.flatMap((m) =>
    m.episodes
      ? [
          `${arcName(m.arc, m.episodes[0], m.episodes[1])}, episodes ${m.episodes[0]} to ${m.episodes[1]}`,
        ]
      : [],
  );
  return `Anime episodes by arc. ${parts.join(". ")}`;
};

const chapterSummary = (mapping: SeriesMapping): string => {
  const parts = mapping.mappings.map((m) => {
    const label = arcName(m.arc, m.chapters[0], m.chapters[1]);
    const range = `chapters ${m.chapters[0]} to ${m.chapters[1]}`;
    return m.episodes
      ? `${label}, ${range}`
      : `${label}, ${range}, not yet adapted`;
  });
  return `Manga chapters by arc. ${parts.join(". ")}`;
};

export function EpisodeChapterRail({
  mapping,
  seriesId,
  totalChapters,
  onMarked,
}: {
  mapping: SeriesMapping;
  seriesId: string;
  totalChapters?: number | null;
  onMarked?: (side: ProgressSide, position: number, previous?: number) => void;
}) {
  const router = useRouter();
  const { containerRef, hover, moveTo, clearHover } = useHoverLabel();
  const routeId = Number(seriesId);
  const setSide = useProgress((s) => s.setSide);
  const progress = useSeriesProgress(routeId);

  const goToArc = (arcIdx: number) => {
    router.push({
      pathname: "/series/[id]/arc/[arcIdx]",
      params: { id: seriesId, arcIdx: String(arcIdx) },
    });
  };

  const markSide = (side: ProgressSide, position: number) => {
    const previous =
      useProgress.getState().byRouteId[routeId]?.[side]?.position;
    setSide(routeId, side, position);
    onMarked?.(side, position, previous);
  };

  const hasUnadapted = mapping.mappings.some((m) => !m.episodes);
  const maxCoveredChapter = Math.max(
    ...mapping.mappings.map((m) => m.chapters[1]),
  );
  const showTail =
    !hasUnadapted &&
    typeof totalChapters === "number" &&
    totalChapters > maxCoveredChapter;
  const tailSpan = showTail ? totalChapters! - maxCoveredChapter : 0;

  const animeTotal = mapping.mappings.reduce(
    (acc, m) => (m.episodes ? Math.max(acc, m.episodes[1]) : acc),
    0,
  );
  const mangaTotal = showTail ? totalChapters! : maxCoveredChapter;

  const movieMarkers = (mapping.movies ?? []).filter(
    (movie): movie is MovieEntry & { afterEpisode: number } =>
      typeof movie.afterEpisode === "number",
  );

  const animeFrac =
    progress?.anime && animeTotal > 0
      ? Math.min(progress.anime.position, animeTotal) / animeTotal
      : null;
  const mangaFrac =
    progress?.manga && mangaTotal > 0
      ? Math.min(progress.manga.position, mangaTotal) / mangaTotal
      : null;

  return (
    <View ref={containerRef} style={styles.container}>
      <Text style={styles.label}>Anime episodes →</Text>
      <View
        style={styles.rail}
        accessibilityRole="summary"
        accessibilityLabel={episodeSummary(mapping)}
      >
        {mapping.mappings.map((m, idx) => {
          if (!m.episodes) return null;
          const eps = m.episodes;
          const span = eps[1] - eps[0] + 1;
          const label = m.arc ?? `${eps[0]}–${eps[1]}`;
          const color = ARC_COLORS[idx % ARC_COLORS.length];
          return (
            <Pressable
              key={`ep-${idx}`}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onPress={() => markSide("anime", eps[1])}
              onLongPress={() => goToArc(idx)}
              delayLongPress={LONG_PRESS_MS}
              onHoverOut={clearHover}
              // @ts-expect-error react-native-web forwards onMouseMove to the DOM
              onMouseMove={(e: MouseLike) =>
                moveTo({ label, color, textColor: COLOR.textOnBright }, e)
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
        {animeFrac !== null && <ProgressOverlay frac={animeFrac} />}
      </View>
      {movieMarkers.length > 0 && animeTotal > 0 && (
        <View style={styles.movieLane}>
          {movieMarkers.map((movie, idx) => {
            const label = `${movie.title} (${movie.year})${
              movie.chapters
                ? ` · ch ${movie.chapters[0]}–${movie.chapters[1]}`
                : ""
            }`;
            return (
              <View
                key={`mv-${idx}`}
                style={[
                  styles.movieAnchor,
                  {
                    left: `${Math.min(movie.afterEpisode / animeTotal, 1) * 100}%`,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="text"
                  accessibilityLabel={label}
                  onHoverOut={clearHover}
                  // @ts-expect-error react-native-web forwards onMouseMove to the DOM
                  onMouseMove={(e: MouseLike) =>
                    moveTo(
                      {
                        label,
                        color: MOVIE_COLOR,
                        textColor: COLOR.textOnBright,
                      },
                      e,
                    )
                  }
                  style={styles.movieMarker}
                >
                  <Text style={styles.movieMarkerText}>◆</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.label}>Manga chapters →</Text>
      <View
        style={styles.rail}
        accessibilityRole="summary"
        accessibilityLabel={chapterSummary(mapping)}
      >
        {mapping.mappings.map((m, idx) => {
          const span = m.chapters[1] - m.chapters[0] + 1;
          const unadapted = !m.episodes;
          const bg = unadapted
            ? COLOR.surfaceRaised
            : ARC_COLORS[idx % ARC_COLORS.length];
          const textStyle = unadapted
            ? styles.unadaptedBarText
            : styles.barText;
          const popoverTextColor = unadapted
            ? COLOR.textMuted
            : COLOR.textOnBright;
          const label = m.arc ?? `${m.chapters[0]}–${m.chapters[1]}`;
          return (
            <Pressable
              key={`ch-${idx}`}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onPress={() => markSide("manga", m.chapters[1])}
              onLongPress={() => goToArc(idx)}
              delayLongPress={LONG_PRESS_MS}
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
        {mangaFrac !== null && <ProgressOverlay frac={mangaFrac} />}
      </View>

      <Text style={styles.hint}>
        Tap to mark · Long-press to open arc
        {movieMarkers.length > 0 ? " · ◆ movie premiere" : ""}
      </Text>

      <HoverLabel hover={hover} />
    </View>
  );
}

function ProgressOverlay({ frac }: { frac: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[styles.unconsumedOverlay, { left: `${frac * 100}%`, right: 0 }]}
      />
      <View style={[styles.progressMarker, { left: `${frac * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, width: "100%", position: "relative" },
  label: {
    color: COLOR.textMuted,
    fontSize: 12,
    paddingTop: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
  hint: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    paddingTop: 4,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
  rail: {
    flexDirection: "row",
    height: BAR_HEIGHT,
    width: "100%",
    backgroundColor: COLOR.progressTrack,
    overflow: "hidden",
    position: "relative",
  },
  bar: {
    height: BAR_HEIGHT,
    paddingHorizontal: 10,
    justifyContent: "center",
    minWidth: 0,
  },
  barText: {
    color: COLOR.textOnBright,
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.bold,
  },
  tailBar: {
    backgroundColor: COLOR.surfaceRaised,
  },
  tailBarText: {
    color: COLOR.textMuted,
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.bold,
  },
  movieLane: {
    height: 18,
    width: "100%",
    position: "relative",
  },
  movieAnchor: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  movieMarker: {
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  movieMarkerText: {
    color: MOVIE_COLOR,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: FONT.bold,
  },
  unadaptedBarText: {
    color: COLOR.textMuted,
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.bold,
  },
  unconsumedOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: COLOR.overlayUnconsumed,
  },
  progressMarker: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLOR.textPrimary,
  },
});
