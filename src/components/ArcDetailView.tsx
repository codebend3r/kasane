import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import type { MappingEntry, SeriesMapping } from '@/types';
import { FONT } from '@/theme';

type ChapterRow = { chapter: number; episode?: number };

export function ArcDetailView({
  mapping,
  arcIndex,
}: {
  mapping: SeriesMapping;
  arcIndex: number;
}) {
  const arc = mapping.mappings[arcIndex];

  if (!arc) {
    return (
      <>
        <Stack.Screen options={{ title: 'Arc' }} />
        <View style={styles.center}>
          <Text style={styles.empty}>Arc not found.</Text>
        </View>
      </>
    );
  }

  const arcTitle = arc.arc ?? `Arc ${arcIndex + 1}`;
  const arcEpisodes = arc.episodes;
  const episodes = expandEpisodes(arc);
  const chapters = expandChapters(arc);

  return (
    <>
      <Stack.Screen options={{ title: arcTitle }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <Text style={styles.eyebrow}>{mapping.title}</Text>
          <Text style={styles.title}>{arcTitle}</Text>
          <Text style={styles.meta}>
            {arcEpisodes
              ? `Episodes ${arcEpisodes[0]}–${arcEpisodes[1]} · Chapters ${arc.chapters[0]}–${arc.chapters[1]}${arc.season ? ` · Season ${arc.season}` : ''}`
              : `Chapters ${arc.chapters[0]}–${arc.chapters[1]} · Not yet in the anime`}
          </Text>
          {arc.note ? <Text style={styles.note}>{arc.note}</Text> : null}
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.columnLabel}>Anime episodes</Text>
            {arcEpisodes ? (
              episodes.map((ep) => (
                <View key={ep.episode} style={styles.row}>
                  <View style={styles.indexBadge}>
                    <Text style={styles.indexBadgeText}>{ep.episode}</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>Episode {ep.episode}</Text>
                    <Text style={styles.rowSub}>
                      Manga ch {ep.chapterStart === ep.chapterEnd
                        ? ep.chapterStart
                        : `${ep.chapterStart}–${ep.chapterEnd}`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.columnEmpty}>
                <Text style={styles.columnEmptyTitle}>Not yet adapted</Text>
                <Text style={styles.columnEmptySub}>
                  This arc hasn&apos;t aired in the anime yet.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.column}>
            <Text style={styles.columnLabel}>Manga chapters</Text>
            {chapters.map((ch) => (
              <View key={ch.chapter} style={styles.row}>
                <View style={[styles.indexBadge, styles.indexBadgeAlt]}>
                  <Text style={styles.indexBadgeText}>{ch.chapter}</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>Chapter {ch.chapter}</Text>
                  {ch.episode !== undefined ? (
                    <Text style={styles.rowSub}>Anime ep {ch.episode}</Text>
                  ) : (
                    <Text style={styles.rowSub}>Unadapted</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function expandEpisodes(arc: MappingEntry) {
  if (!arc.episodes) return [];
  const [e1, e2] = arc.episodes;
  const [c1, c2] = arc.chapters;
  const epCount = e2 - e1 + 1;
  const chCount = c2 - c1 + 1;
  const chPerEp = chCount / epCount;

  return Array.from({ length: epCount }, (_, i) => {
    const episode = e1 + i;
    const chapterStart = c1 + Math.floor(i * chPerEp);
    const chapterEnd = c1 + Math.max(Math.ceil((i + 1) * chPerEp) - 1, Math.floor(i * chPerEp));
    return { episode, chapterStart, chapterEnd: Math.min(chapterEnd, c2) };
  });
}

function expandChapters(arc: MappingEntry): ChapterRow[] {
  const [c1, c2] = arc.chapters;
  const chCount = c2 - c1 + 1;

  if (!arc.episodes) {
    return Array.from({ length: chCount }, (_, i): ChapterRow => ({ chapter: c1 + i }));
  }

  const [e1, e2] = arc.episodes;
  const epCount = e2 - e1 + 1;
  const epPerCh = epCount / chCount;

  return Array.from({ length: chCount }, (_, i): ChapterRow => {
    const chapter = c1 + i;
    const episode = e1 + Math.min(Math.floor(i * epPerCh), epCount - 1);
    return { chapter, episode };
  });
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#9aa0a6', fontFamily: FONT.regular },
  head: { gap: 4 },
  eyebrow: {
    color: '#7c5cff',
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 36,
    letterSpacing: -1,
    fontFamily: FONT.bold,
  },
  meta: {
    color: '#9aa0a6',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: FONT.semibold,
  },
  note: {
    color: '#cfd2d6',
    fontSize: 13,
    paddingTop: 6,
    fontStyle: 'italic',
    fontFamily: FONT.regular,
  },
  columns: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  column: { flex: 1, minWidth: 280, gap: 8 },
  columnLabel: {
    color: '#9aa0a6',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingBottom: 4,
    fontFamily: FONT.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#17181b',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  indexBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c5cff',
  },
  indexBadgeAlt: { backgroundColor: '#ff7c5c' },
  indexBadgeText: { color: '#000', fontSize: 14, fontFamily: FONT.bold },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { color: '#f5f5f5', fontSize: 15, fontFamily: FONT.semibold },
  rowSub: { color: '#9aa0a6', fontSize: 12, fontFamily: FONT.regular },
  columnEmpty: {
    backgroundColor: '#17181b',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 4,
  },
  columnEmptyTitle: { color: '#f5f5f5', fontSize: 14, fontFamily: FONT.semibold },
  columnEmptySub: { color: '#9aa0a6', fontSize: 12, fontFamily: FONT.regular },
});
