import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Footer } from "@/components/Footer";
import { Paragraph } from "@/components/Paragraph";
import { expandChapters, expandEpisodes } from "@/data/arcDetail";
import type { SeriesMapping } from "@/types";
import { COLOR, FONT, SPACE } from "@/theme";

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
        <Stack.Screen options={{ title: "Arc" }} />
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
              ? `Episodes ${arcEpisodes[0]}–${arcEpisodes[1]} · Chapters ${arc.chapters[0]}–${arc.chapters[1]}${arc.season ? ` · Season ${arc.season}` : ""}`
              : `Chapters ${arc.chapters[0]}–${arc.chapters[1]} · Not yet in the anime`}
          </Text>
          {!!arc.note && <Paragraph style={styles.note}>{arc.note}</Paragraph>}
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
                      Manga ch{" "}
                      {ep.chapterStart === ep.chapterEnd
                        ? ep.chapterStart
                        : `${ep.chapterStart}–${ep.chapterEnd}`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.columnEmpty}>
                <Text style={styles.columnEmptyTitle}>Not yet adapted</Text>
                <Paragraph style={styles.columnEmptySub}>
                  This arc hasn&apos;t aired in the anime yet.
                </Paragraph>
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
                  <Text style={styles.rowSub}>
                    {ch.episode === null
                      ? "Unadapted"
                      : `Anime ep ${ch.episode}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <Footer />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: SPACE.xl, gap: SPACE.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: COLOR.textMuted, fontFamily: FONT.regular },
  head: { gap: SPACE.xs },
  eyebrow: {
    color: COLOR.accent,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  title: {
    color: COLOR.textPrimary,
    fontSize: 36,
    letterSpacing: -1,
    fontFamily: FONT.bold,
  },
  meta: {
    color: COLOR.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
  note: {
    color: COLOR.textSecondary,
    fontSize: 13,
    paddingTop: SPACE.sm,
    fontStyle: "italic",
    fontFamily: FONT.regular,
  },
  columns: { flexDirection: "row", gap: SPACE.xl, flexWrap: "wrap" },
  column: { flex: 1, minWidth: 280, gap: SPACE.md },
  columnLabel: {
    color: COLOR.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    paddingBottom: SPACE.xs,
    fontFamily: FONT.semibold,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.lg,
    backgroundColor: COLOR.surface,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.mdl,
  },
  indexBadge: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR.accent,
  },
  indexBadgeAlt: { backgroundColor: COLOR.sideManga },
  indexBadgeText: {
    color: COLOR.textOnBright,
    fontSize: 14,
    fontFamily: FONT.bold,
  },
  rowBody: { flex: 1, gap: SPACE.xxs },
  rowTitle: {
    color: COLOR.textPrimary,
    fontSize: 15,
    fontFamily: FONT.semibold,
  },
  rowSub: { color: COLOR.textMuted, fontSize: 12, fontFamily: FONT.regular },
  columnEmpty: {
    backgroundColor: COLOR.surface,
    paddingHorizontal: SPACE.lgx,
    paddingVertical: SPACE.xl,
    gap: SPACE.xs,
  },
  columnEmptyTitle: {
    color: COLOR.textPrimary,
    fontSize: 14,
    fontFamily: FONT.semibold,
  },
  columnEmptySub: {
    color: COLOR.textMuted,
    fontSize: 12,
    fontFamily: FONT.regular,
  },
});
