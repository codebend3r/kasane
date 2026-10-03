import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PressableState, ResolvedMapping, SeriesBadge } from "@/types";
import { buildArcLayout } from "@/data/arcLayout";
import {
  chapterToEpisodes,
  episodeToChapters,
  isAdapted,
} from "@/data/mapping";
import { useProgress, type ProgressSide } from "@/state/progress";
import { AutoEstimatedBanner } from "@/components/AutoEstimatedBanner";
import { EpisodeChapterPie } from "@/components/EpisodeChapterPie";
import { EpisodeChapterRail } from "@/components/EpisodeChapterRail";
import { NoMappingNotice } from "@/components/NoMappingNotice";
import {
  ProgressMarkBanner,
  type MarkEvent,
} from "@/components/ProgressMarkBanner";
import { QuickLookup } from "@/components/QuickLookup";
import { SeasonCoverage } from "@/components/SeasonCoverage";
import { SeriesMovies } from "@/components/SeriesMovies";
import { COLOR, FONT } from "@/theme";

type MappingView = "rail" | "pie";

type MappingSectionProps = {
  resolved: ResolvedMapping | null;
  routeId: number;
  totalChapters: number | null;
  badge: SeriesBadge;
  /** Phones default to the pie; the rail needs horizontal room. */
  isMobile: boolean;
};

export function MappingSection({
  resolved,
  routeId,
  totalChapters,
  badge,
  isMobile,
}: MappingSectionProps) {
  const [mappingView, setMappingView] = useState<MappingView>(
    isMobile ? "pie" : "rail",
  );
  const [markEvent, setMarkEvent] = useState<MarkEvent | null>(null);
  const layout = useMemo(
    () =>
      resolved
        ? buildArcLayout({ mapping: resolved.mapping, totalChapters })
        : null,
    [resolved, totalChapters],
  );

  const onMarked = (
    side: ProgressSide,
    position: number,
    previous?: number,
  ) => {
    const otherSide: ProgressSide = side === "anime" ? "manga" : "anime";
    const otherPosition =
      useProgress.getState().byRouteId[routeId]?.[otherSide]?.position ?? 0;
    const range = resolved
      ? side === "anime"
        ? episodeToChapters(resolved.mapping, position)
        : chapterToEpisodes(resolved.mapping, position)
      : null;
    const suggested = range?.[1];
    const suggestion =
      typeof suggested === "number" && suggested > otherPosition
        ? { side: otherSide, position: suggested }
        : undefined;
    setMarkEvent({ side, position, previous, suggestion });
  };

  if (!resolved || !layout) {
    if (badge === "anime-only") return null;
    return <NoMappingNotice />;
  }

  const { mapping, source } = resolved;
  const arcsBehind = mapping.mappings.filter((m) => !isAdapted(m)).length;
  const movies = mapping.movies ?? [];

  return (
    <View style={styles.mappingBlock}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleLeft}>
          <Text style={styles.sectionTitle}>Episode ↔ Chapter map</Text>
          {arcsBehind > 0 && (
            <View style={styles.arcsBehindBadge}>
              <Text style={styles.arcsBehindText}>
                {arcsBehind} {arcsBehind === 1 ? "ARC" : "ARCS"} BEHIND
              </Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={() => setMappingView((v) => (v === "rail" ? "pie" : "rail"))}
          accessibilityRole="button"
          accessibilityLabel={
            mappingView === "rail" ? "Show pie chart view" : "Show rail view"
          }
          style={({ hovered, pressed }: PressableState) => [
            styles.viewToggle,
            { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.viewToggleIcon}>
            {mappingView === "rail" ? "◐" : "▤"}
          </Text>
        </Pressable>
      </View>
      {source === "estimated" && <AutoEstimatedBanner />}
      {!!markEvent && (
        <ProgressMarkBanner
          event={markEvent}
          routeId={routeId}
          onDismiss={() => setMarkEvent(null)}
        />
      )}
      {mappingView === "rail" ? (
        <EpisodeChapterRail
          layout={layout}
          movies={movies}
          routeId={routeId}
          onMarked={onMarked}
        />
      ) : (
        <EpisodeChapterPie
          layout={layout}
          routeId={routeId}
          onMarked={onMarked}
        />
      )}
      <QuickLookup mapping={mapping} />
      {source === "curated" && <SeasonCoverage mapping={mapping} />}
      {movies.length > 0 && <SeriesMovies movies={movies} />}
    </View>
  );
}

const styles = StyleSheet.create({
  mappingBlock: { gap: 10 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sectionTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  sectionTitle: {
    color: COLOR.textPrimary,
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  arcsBehindBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLOR.surfaceRaised,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.notice,
  },
  arcsBehindText: {
    color: COLOR.notice,
    fontSize: 14,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
  viewToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 2,
    borderLeftColor: COLOR.accent,
  },
  viewToggleIcon: {
    color: COLOR.textSecondary,
    fontSize: 16,
    fontFamily: FONT.bold,
    lineHeight: 18,
  },
});
