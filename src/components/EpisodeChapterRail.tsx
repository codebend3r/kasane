import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { SeriesMapping } from '../types';

const COLORS = [
  '#7c5cff', '#ff7c5c', '#5cff9d', '#ffd65c',
  '#5cdfff', '#ff5c9d', '#9dff5c', '#ff9d5c',
];

const BAR_HEIGHT = 36;
const PX_PER_UNIT = 14;

export function EpisodeChapterRail({ mapping }: { mapping: SeriesMapping }) {
  const [selected, setSelected] = useState<number | null>(null);

  const totals = useMemo(() => {
    const lastEp = Math.max(...mapping.mappings.map((m) => m.episodes[1]));
    const lastCh = Math.max(...mapping.mappings.map((m) => m.chapters[1]));
    return { lastEp, lastCh };
  }, [mapping]);

  const railWidth = Math.max(totals.lastEp, totals.lastCh) * PX_PER_UNIT;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={[styles.rails, { width: railWidth + 40 }]}>
        <Text style={styles.label}>Anime episodes →</Text>
        <View style={[styles.rail, { width: totals.lastEp * PX_PER_UNIT }]}>
          {mapping.mappings.map((m, idx) => {
            const left = (m.episodes[0] - 1) * PX_PER_UNIT;
            const width = (m.episodes[1] - m.episodes[0] + 1) * PX_PER_UNIT;
            const active = selected === idx;
            return (
              <View
                key={`ep-${idx}`}
                onTouchEnd={() => setSelected(active ? null : idx)}
                style={[
                  styles.bar,
                  {
                    left,
                    width,
                    backgroundColor: COLORS[idx % COLORS.length],
                    opacity: selected === null || active ? 1 : 0.3,
                  },
                ]}
              >
                <Text style={styles.barText} numberOfLines={1}>
                  {m.arc ?? `${m.episodes[0]}–${m.episodes[1]}`}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.connectors}>
          {selected !== null && (
            <Text style={styles.connectorText}>
              Episodes {mapping.mappings[selected].episodes.join('–')} ↔ Chapters{' '}
              {mapping.mappings[selected].chapters.join('–')}
            </Text>
          )}
        </View>

        <Text style={styles.label}>Manga chapters →</Text>
        <View style={[styles.rail, { width: totals.lastCh * PX_PER_UNIT }]}>
          {mapping.mappings.map((m, idx) => {
            const left = (m.chapters[0] - 1) * PX_PER_UNIT;
            const width = (m.chapters[1] - m.chapters[0] + 1) * PX_PER_UNIT;
            const active = selected === idx;
            return (
              <View
                key={`ch-${idx}`}
                onTouchEnd={() => setSelected(active ? null : idx)}
                style={[
                  styles.bar,
                  {
                    left,
                    width,
                    backgroundColor: COLORS[idx % COLORS.length],
                    opacity: selected === null || active ? 1 : 0.3,
                  },
                ]}
              >
                <Text style={styles.barText} numberOfLines={1}>
                  {m.chapters[0]}–{m.chapters[1]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rails: { paddingVertical: 16, paddingHorizontal: 16, gap: 10 },
  label: { color: '#9aa0a6', fontSize: 12, marginTop: 8 },
  rail: { height: BAR_HEIGHT, position: 'relative', backgroundColor: '#1a1a1a', borderRadius: 6 },
  bar: {
    position: 'absolute',
    top: 0,
    height: BAR_HEIGHT,
    borderRadius: 4,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  barText: { color: '#000', fontSize: 11, fontWeight: '600' },
  connectors: { minHeight: 24, justifyContent: 'center' },
  connectorText: { color: '#cfd2d6', fontSize: 13, fontStyle: 'italic' },
});
