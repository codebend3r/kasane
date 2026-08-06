import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PressableState, SeriesBadge, SeriesMapping } from "@/types";
import { chapterToEpisodes, episodeToChapters } from "@/data";
import { useProgress, type ProgressSide } from "@/state/progress";
import { EpisodeChapterPie } from "@/components/EpisodeChapterPie";
import { EpisodeChapterRail } from "@/components/EpisodeChapterRail";
import { Paragraph } from "@/components/Paragraph";
import {
  ProgressMarkBanner,
  type MarkEvent,
} from "@/components/ProgressMarkBanner";
import { SeasonCoverage } from "@/components/SeasonCoverage";
import { SeriesMovies } from "@/components/SeriesMovies";
import { COLOR, FONT } from "@/theme";

type MappingView = "rail" | "pie";

type MappingSectionProps = {
  mapping: SeriesMapping | null;
  /** Present only when the mapping is curated rather than auto-estimated. */
  curatedMapping: SeriesMapping | null;
  routeId: number;
  totalChapters: number | null;
  badge: SeriesBadge;
  /** Phones default to the pie; the rail needs horizontal room. */
  isMobile: boolean;
};

export function MappingSection({
  mapping,
  curatedMapping,
  routeId,
  totalChapters,
  badge,
  isMobile,
}: MappingSectionProps) {
  const [mappingView, setMappingView] = useState<MappingView>(
    isMobile ? "pie" : "rail",
  );
  const [markEvent, setMarkEvent] = useState<MarkEvent | null>(null);

  const onMarked = (
    side: ProgressSide,
    position: number,
    previous?: number,
  ) => {
    const otherSide: ProgressSide = side === "anime" ? "manga" : "anime";
    const otherPosition =
      useProgress.getState().byRouteId[routeId]?.[otherSide]?.position ?? 0;
    const range = mapping
      ? side === "anime"
        ? episodeToChapters(mapping, position)
        : chapterToEpisodes(mapping, position)
      : null;
    const suggested = range?.[1];
    const suggestion =
      typeof suggested === "number" && suggested > otherPosition
        ? { side: otherSide, position: suggested }
        : undefined;
    setMarkEvent({ side, position, previous, suggestion });
  };

  if (!mapping) {
    if (badge === "anime-only") return null;
    return (
      <View style={styles.noMapping}>
        <Text style={styles.noMappingTitle}>No mapping available yet</Text>
        <Paragraph style={styles.noMappingBody}>
          We couldn&apos;t find an anime↔manga adaptation pair on AniList for
          this entry, and no curated mapping exists for it yet.
        </Paragraph>
      </View>
    );
  }

  const isAutoEstimated = !curatedMapping;
  const arcsBehind = mapping.mappings.filter((m) => !m.episodes).length;
  const movies = curatedMapping?.movies ?? [];

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
      {isAutoEstimated && (
        <View style={styles.autoBanner}>
          <View style={styles.autoBadge}>
            <Text style={styles.autoBadgeText}>AUTO-ESTIMATED</Text>
          </View>
          <Paragraph style={styles.autoBannerBody}>
            Linear pacing — anime episode count distributed evenly across the
            manga chapter count. Real pacing varies; a curated mapping overrides
            this estimate.
          </Paragraph>
        </View>
      )}
      {!!markEvent && (
        <ProgressMarkBanner
          event={markEvent}
          routeId={routeId}
          onDismiss={() => setMarkEvent(null)}
        />
      )}
      {mappingView === "rail" ? (
        <EpisodeChapterRail
          mapping={mapping}
          seriesId={String(routeId)}
          totalChapters={totalChapters}
          onMarked={onMarked}
        />
      ) : (
        <EpisodeChapterPie
          mapping={mapping}
          seriesId={String(routeId)}
          totalChapters={totalChapters}
          onMarked={onMarked}
        />
      )}
      {!!curatedMapping && <SeasonCoverage mapping={curatedMapping} />}
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
  autoBanner: {
    padding: 14,
    backgroundColor: COLOR.surfaceNotice,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.notice,
    gap: 8,
  },
  autoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLOR.notice,
  },
  autoBadgeText: {
    color: COLOR.background,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONT.bold,
  },
  autoBannerBody: {
    color: COLOR.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT.regular,
  },
  noMapping: {
    padding: 16,
    backgroundColor: COLOR.surface,
    gap: 6,
  },
  noMappingTitle: { color: COLOR.notice, fontFamily: FONT.bold },
  noMappingBody: {
    color: COLOR.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT.regular,
  },
});
