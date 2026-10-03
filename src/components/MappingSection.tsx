import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { PressableState, ResolvedMapping, SeriesBadge } from "@/types";
import { buildArcLayout } from "@/data/arcLayout";
import { isAdapted } from "@/data/mapping";
import { useSeriesProgress } from "@/state/progress";
import { AutoEstimatedBanner } from "@/components/AutoEstimatedBanner";
import { EpisodeChapterPie } from "@/components/EpisodeChapterPie";
import { EpisodeChapterRail } from "@/components/EpisodeChapterRail";
import { NoMappingNotice } from "@/components/NoMappingNotice";
import { ProgressMarkBanner } from "@/components/ProgressMarkBanner";
import { QuickLookup } from "@/components/QuickLookup";
import { SeasonCoverage } from "@/components/SeasonCoverage";
import { SeriesMovies } from "@/components/SeriesMovies";
import { useMarkProgress } from "@/components/useMarkProgress";
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
  const router = useRouter();
  const progress = useSeriesProgress(routeId);
  const marking = useMarkProgress({
    routeId,
    mapping: resolved?.mapping ?? null,
  });
  const layout = useMemo(
    () =>
      resolved
        ? buildArcLayout({ mapping: resolved.mapping, totalChapters })
        : null,
    [resolved, totalChapters],
  );

  const openArc = (arcIndex: number) => {
    router.push({
      pathname: "/series/[id]/arc/[arcIdx]",
      params: { id: String(routeId), arcIdx: String(arcIndex) },
    });
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
      {!!marking.event && (
        <ProgressMarkBanner
          event={marking.event}
          onUndo={marking.undo}
          onAcceptSuggestion={marking.acceptSuggestion}
          onDismiss={marking.dismiss}
        />
      )}
      {mappingView === "rail" ? (
        <EpisodeChapterRail
          layout={layout}
          movies={movies}
          progress={progress}
          onMark={marking.mark}
          onOpenArc={openArc}
        />
      ) : (
        <EpisodeChapterPie
          layout={layout}
          progress={progress}
          onMark={marking.mark}
          onOpenArc={openArc}
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
