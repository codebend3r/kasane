import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getMediaByIds } from '@/api/anilist';
import { pairResults } from '@/data';
import { useInProgressEntries } from '@/state/progress';
import { SeriesCard } from '@/components/SeriesCard';
import type { AniListMedia, SeriesEntry } from '@/types';
import { FONT } from '@/theme';

const STALE_MS = 60 * 60 * 1000;
const PARTNER_RELATIONS = new Set(['ADAPTATION', 'SOURCE']);

export function ContinueSection() {
  const entries = useInProgressEntries();
  const ids = useMemo(() => entries.map((e) => e.routeId), [entries]);
  const idsKey = ids.join(',');

  const { data: primary } = useQuery({
    queryKey: ['continue-primary', idsKey],
    queryFn: () => getMediaByIds(ids),
    enabled: ids.length > 0,
    staleTime: STALE_MS,
  });

  const partnerIds = useMemo(() => {
    if (!primary) return [];
    const known = new Set(ids);
    const collected = primary.flatMap((m) =>
      (m.relations?.edges ?? [])
        .filter(
          (e) =>
            PARTNER_RELATIONS.has(e.relationType) &&
            (e.node.type === 'ANIME' || e.node.type === 'MANGA')
        )
        .map((e) => e.node.id)
    );
    return Array.from(new Set(collected)).filter((id) => !known.has(id));
  }, [primary, ids]);

  const { data: partners } = useQuery({
    queryKey: ['continue-partners', partnerIds.join(',')],
    queryFn: () => getMediaByIds(partnerIds),
    enabled: partnerIds.length > 0,
    staleTime: STALE_MS,
  });

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
  section: { gap: 8 },
  header: { gap: 2 },
  eyebrow: {
    color: '#5cff9d',
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 22,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  list: { gap: 0 },
});
