import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { SeriesMapping } from '@/types';
import { chapterToEpisodes, episodeToChapters } from '@/data';
import { FONT } from '@/theme';

export function QuickLookup({ mapping }: { mapping: SeriesMapping }) {
  const [chInput, setChInput] = useState('');
  const [epInput, setEpInput] = useState('');

  const chNum = Number(chInput);
  const epNum = Number(epInput);
  const fromCh =
    !Number.isNaN(chNum) && chNum > 0 ? chapterToEpisodes(mapping, chNum) : null;
  const fromEp =
    !Number.isNaN(epNum) && epNum > 0 ? episodeToChapters(mapping, epNum) : null;
  const seasonForCh = useMemo(() => {
    if (!chNum) return null;
    const hit = mapping.mappings.find(
      (m) => chNum >= m.chapters[0] && chNum <= m.chapters[1]
    );
    return hit?.season ?? null;
  }, [chNum, mapping]);

  return (
    <View style={styles.lookup}>
      <Text style={styles.title}>Quick lookup</Text>
      <View style={styles.row}>
        <Text style={styles.label}>I finished chapter</Text>
        <TextInput
          value={chInput}
          onChangeText={setChInput}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="e.g. 38"
          placeholderTextColor="#6b7177"
        />
        <Text style={styles.result}>
          → {fromCh ? `episodes ${fromCh[0]}–${fromCh[1]}` : '—'}
          {seasonForCh ? ` (S${seasonForCh})` : ''}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>I finished episode</Text>
        <TextInput
          value={epInput}
          onChangeText={setEpInput}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="e.g. 12"
          placeholderTextColor="#6b7177"
        />
        <Text style={styles.result}>
          → {fromEp ? `chapters ${fromEp[0]}–${fromEp[1]}` : '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lookup: { gap: 12, marginTop: 8 },
  title: {
    color: '#f5f5f5',
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  label: { color: '#cfd2d6', fontSize: 13, fontFamily: FONT.medium },
  input: {
    backgroundColor: '#17181b',
    color: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 80,
    fontFamily: FONT.regular,
  },
  result: { color: '#7c5cff', fontSize: 13, fontFamily: FONT.bold },
});
