import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MouseLike, MovieEntry, ProgressSide } from "@/types";
import {
  COLOR,
  FONT,
  LONG_PRESS_MS,
  MOVIE_COLOR,
  arcColors,
  pressFeedback,
  SPACE,
} from "@/theme";
import {
  describeChapters,
  describeEpisodes,
  fractionAt,
  segmentLabel,
  type ArcAxis,
  type ArcLayout,
} from "@/data/arcLayout";
import type { SeriesProgress } from "@/state/progress";
import {
  HoverLabel,
  useHoverLabel,
  type HoverContent,
} from "@/components/HoverLabel";

const BAR_HEIGHT = 44;

const hasAfterEpisode = (
  movie: MovieEntry,
): movie is MovieEntry & { afterEpisode: number } =>
  typeof movie.afterEpisode === "number";

/** Tap a bar to mark through its end; long-press to open the arc. */
export function EpisodeChapterRail({
  layout,
  movies,
  progress,
  onMark,
  onOpenArc,
}: {
  layout: ArcLayout;
  movies: readonly MovieEntry[];
  progress: SeriesProgress | undefined;
  onMark: (side: ProgressSide, position: number) => void;
  onOpenArc: (arcIndex: number) => void;
}) {
  const { containerRef, hover, moveTo, clearHover } = useHoverLabel();
  const movieMarkers = movies.filter(hasAfterEpisode);
  const lane = { onMark, onOpenArc, moveTo, clearHover };

  return (
    <View ref={containerRef} style={styles.container}>
      <ArcLane
        {...lane}
        side="anime"
        label="Anime episodes →"
        description={describeEpisodes(layout)}
        axis={layout.anime}
        position={progress?.anime?.position ?? null}
      />
      {movieMarkers.length > 0 && layout.anime.total > 0 && (
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
                    left: `${fractionAt(layout.anime, movie.afterEpisode) * 100}%`,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="text"
                  accessibilityLabel={label}
                  onHoverOut={clearHover}
                  onMouseMove={(e) =>
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

      <ArcLane
        {...lane}
        side="manga"
        label="Manga chapters →"
        description={describeChapters(layout)}
        axis={layout.manga}
        position={progress?.manga?.position ?? null}
      />

      <Text style={styles.hint}>
        Tap to mark · Long-press to open arc
        {movieMarkers.length > 0 ? " · ◆ movie premiere" : ""}
      </Text>

      <HoverLabel hover={hover} />
    </View>
  );
}

/**
 * One side's bars, drawn end to end by span, with the reader's progress laid
 * over them. The manga's unmapped tail is context, not an arc, so it draws as
 * a plain bar with nothing to mark or open.
 */
function ArcLane({
  side,
  label,
  description,
  axis,
  position,
  onMark,
  onOpenArc,
  moveTo,
  clearHover,
}: {
  side: ProgressSide;
  label: string;
  description: string;
  axis: ArcAxis;
  position: number | null;
  onMark: (side: ProgressSide, position: number) => void;
  onOpenArc: (arcIndex: number) => void;
  moveTo: (content: HoverContent, e: MouseLike) => void;
  clearHover: () => void;
}) {
  const frac =
    position !== null && axis.total > 0 ? fractionAt(axis, position) : null;

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View
        style={styles.rail}
        accessibilityRole="summary"
        accessibilityLabel={description}
      >
        {axis.segments.map((seg) => {
          const text = segmentLabel(seg);
          const colors = arcColors(seg);
          const fill = { flex: seg.span, backgroundColor: colors.fill };
          const barText = (
            <Text
              style={[styles.barText, { color: colors.text }]}
              numberOfLines={1}
            >
              {text}
            </Text>
          );
          const arcIndex = seg.arcIndex;
          if (arcIndex === null) {
            return (
              <View key={`${side}-tail`} style={[styles.bar, fill]}>
                {barText}
              </View>
            );
          }
          return (
            <Pressable
              key={`${side}-${arcIndex}`}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onPress={() => onMark(side, seg.to)}
              onLongPress={() => onOpenArc(arcIndex)}
              delayLongPress={LONG_PRESS_MS}
              onHoverOut={clearHover}
              onMouseMove={(e) =>
                moveTo(
                  { label: text, color: colors.fill, textColor: colors.text },
                  e,
                )
              }
              style={(state) => [styles.bar, fill, pressFeedback(state)]}
            >
              {barText}
            </Pressable>
          );
        })}
        {frac !== null && <ProgressOverlay frac={frac} />}
      </View>
    </>
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
  container: { gap: SPACE.md, width: "100%", position: "relative" },
  label: {
    color: COLOR.textMuted,
    fontSize: 12,
    paddingTop: SPACE.md,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
  hint: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    paddingTop: SPACE.xs,
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
    paddingHorizontal: SPACE.mdl,
    justifyContent: "center",
    minWidth: 0,
  },
  barText: {
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
    paddingHorizontal: SPACE.md,
    justifyContent: "center",
  },
  movieMarkerText: {
    color: MOVIE_COLOR,
    fontSize: 11,
    lineHeight: 18,
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
