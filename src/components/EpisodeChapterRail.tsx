import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MovieEntry, ProgressSide } from "@/types";
import { COLOR, FONT, MOVIE_COLOR, arcColors, pressFeedback } from "@/theme";
import {
  describeChapters,
  describeEpisodes,
  fractionAt,
  segmentLabel,
  type ArcLayout,
} from "@/data/arcLayout";
import type { SeriesProgress } from "@/state/progress";
import { HoverLabel, useHoverLabel } from "@/components/HoverLabel";

const BAR_HEIGHT = 44;
const LONG_PRESS_MS = 320;

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
  const animeFrac =
    progress?.anime && layout.anime.total > 0
      ? fractionAt(layout.anime, progress.anime.position)
      : null;
  const mangaFrac =
    progress?.manga && layout.manga.total > 0
      ? fractionAt(layout.manga, progress.manga.position)
      : null;

  return (
    <View ref={containerRef} style={styles.container}>
      <Text style={styles.label}>Anime episodes →</Text>
      <View
        style={styles.rail}
        accessibilityRole="summary"
        accessibilityLabel={describeEpisodes(layout)}
      >
        {layout.anime.segments.map((seg) => {
          const label = segmentLabel(seg);
          const { fill, text } = arcColors(seg);
          return (
            <Pressable
              key={`ep-${seg.arcIndex}`}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onPress={() => onMark("anime", seg.to)}
              onLongPress={() =>
                seg.arcIndex !== null && onOpenArc(seg.arcIndex)
              }
              delayLongPress={LONG_PRESS_MS}
              onHoverOut={clearHover}
              onMouseMove={(e) =>
                moveTo({ label, color: fill, textColor: text }, e)
              }
              style={(state) => [
                styles.bar,
                {
                  flex: seg.span,
                  backgroundColor: fill,
                },
                pressFeedback(state),
              ]}
            >
              <Text style={[styles.barText, { color: text }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
        {animeFrac !== null && <ProgressOverlay frac={animeFrac} />}
      </View>
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

      <Text style={styles.label}>Manga chapters →</Text>
      <View
        style={styles.rail}
        accessibilityRole="summary"
        accessibilityLabel={describeChapters(layout)}
      >
        {layout.manga.segments.map((seg) => {
          const label = segmentLabel(seg);
          const { fill, text } = arcColors(seg);
          const arcIndex = seg.arcIndex;
          // The unmapped tail is context, not an arc: nothing to mark or open.
          if (arcIndex === null) {
            return (
              <View
                key="tail"
                style={[styles.bar, { flex: seg.span, backgroundColor: fill }]}
              >
                <Text
                  style={[styles.barText, { color: text }]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            );
          }
          return (
            <Pressable
              key={`ch-${arcIndex}`}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onPress={() => onMark("manga", seg.to)}
              onLongPress={() => onOpenArc(arcIndex)}
              delayLongPress={LONG_PRESS_MS}
              onHoverOut={clearHover}
              onMouseMove={(e) =>
                moveTo({ label, color: fill, textColor: text }, e)
              }
              style={(state) => [
                styles.bar,
                {
                  flex: seg.span,
                  backgroundColor: fill,
                },
                pressFeedback(state),
              ]}
            >
              <Text style={[styles.barText, { color: text }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
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
