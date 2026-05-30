import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SeriesMapping } from '@/types';
import { FONT } from '@/theme';

export function SeasonCoverage({ mapping }: { mapping: SeriesMapping }) {
  const seasonBuckets = useMemo(() => {
    const m = mapping.mappings
      .filter((entry) => !!entry.episodes)
      .reduce<Map<string, typeof mapping.mappings>>((acc, entry) => {
        const key = entry.season ? `Season ${entry.season}` : 'Other';
        const list = acc.get(key);
        if (list) list.push(entry);
        else acc.set(key, [entry]);
        return acc;
      }, new Map());
    return Array.from(m.entries());
  }, [mapping]);

  if (seasonBuckets.length === 0) return null;
  if (seasonBuckets.length === 1 && seasonBuckets[0][0] === 'Other') return null;

  return (
    <View style={styles.outer}>
      <View style={styles.block}>
        <Text style={styles.label}>Per-season chapter coverage</Text>
        {seasonBuckets.map(([label, entries]) => {
        const minCh = Math.min(...entries.map((e) => e.chapters[0]));
        const maxCh = Math.max(...entries.map((e) => e.chapters[1]));
        const minEp = Math.min(...entries.map((e) => e.episodes![0]));
        const maxEp = Math.max(...entries.map((e) => e.episodes![1]));
        return (
          <View key={label} style={styles.row}>
            <Text style={styles.name}>{label}</Text>
            <Text style={styles.meta}>
              Eps {minEp}–{maxEp} · Ch {minCh}–{maxCh}
            </Text>
          </View>
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingTop: 4 },
  block: {
    padding: 12,
    backgroundColor: '#17181b',
    gap: 6,
  },
  label: {
    color: '#9aa0a6',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  name: {
    color: '#f5f5f5',
    fontSize: 14,
    fontFamily: FONT.semibold,
  },
  meta: {
    color: '#cfd2d6',
    fontSize: 12,
    fontFamily: FONT.regular,
  },
});
