import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { pairResults, partnerIdOf } from "@/data/pairing";
import { useMediaByIds } from "@/queries/media";
import { useInProgressEntries } from "@/state/progress";
import { SeriesCard } from "@/components/SeriesCard";
import type { AniListMedia, SeriesEntry } from "@/types";
import { COLOR, SPACE, TEXT } from "@/theme";

export function ContinueSection() {
  const entries = useInProgressEntries();
  const ids = useMemo(() => entries.map((e) => e.routeId), [entries]);
  const { data: primary } = useMediaByIds(ids);

  // Each tracked series' partner on the other side, the one `pairResults`
  // pairs it with, unless that partner is itself already tracked.
  const partnerIds = useMemo(() => {
    const known = new Set(ids);
    return [
      ...new Set(
        (primary ?? [])
          .map(partnerIdOf)
          .filter((id): id is number => id !== null && !known.has(id)),
      ),
    ];
  }, [primary, ids]);

  const { data: partners } = useMediaByIds(partnerIds);

  const ordered = useMemo<SeriesEntry[]>(() => {
    if (!primary) return [];
    const all: AniListMedia[] = [...primary, ...(partners ?? [])];
    const paired = pairResults(all);
    const byRouteId = new Map(paired.map((p) => [p.routeId, p]));
    return entries
      .map((e) => byRouteId.get(e.routeId))
      .filter((v): v is SeriesEntry => !!v);
  }, [primary, partners, entries]);

  if (ids.length === 0 || ordered.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Pick up where you left off</Text>
        <Text style={styles.title}>Continue</Text>
      </View>
      <View style={styles.list}>
        {ordered.map((entry) => (
          <SeriesCard key={`continue-${entry.routeId}`} entry={entry} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: SPACE.md },
  header: { gap: SPACE.xxs },
  eyebrow: { ...TEXT.eyebrow, color: COLOR.success },
  title: { ...TEXT.blockTitle, color: COLOR.textPrimary },
  list: { gap: 0 },
});
