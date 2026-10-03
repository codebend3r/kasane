import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { SeriesMapping } from "@/types";
import { arcForChapter, episodeToChapters } from "@/data/mapping";
import { COLOR, FONT } from "@/theme";

export function QuickLookup({ mapping }: { mapping: SeriesMapping }) {
  const [epInput, setEpInput] = useState("");
  const [chInput, setChInput] = useState("");

  const epNum = Number(epInput);
  const chNum = Number(chInput);

  // `NaN > 0` is false, so a non-numeric input reads as no answer.
  const fromEp = epNum > 0 ? episodeToChapters(mapping, epNum) : null;
  const chapterArc = chNum > 0 ? arcForChapter(mapping, chNum) : null;
  const fromCh = chapterArc?.episodes ?? null;
  const seasonForCh = chapterArc?.season ?? null;

  // Only curated mappings carry seasons, so an estimated one never shows a
  // badge it cannot back up.
  const seasonSuffix = seasonForCh ? ` (S${seasonForCh})` : "";
  const seasonSpoken = seasonForCh ? `, season ${seasonForCh}` : "";

  return (
    <View style={styles.lookup}>
      <Text style={styles.sectionTitle}>Quick lookup</Text>
      <View style={styles.lookupRow}>
        <Text style={styles.lookupLabel}>I finished episode</Text>
        <TextInput
          value={epInput}
          onChangeText={setEpInput}
          keyboardType="number-pad"
          style={styles.lookupInput}
          placeholder="e.g. 12"
          accessibilityLabel="I finished episode"
          placeholderTextColor={COLOR.textFaint}
        />
        <Text
          style={styles.lookupResult}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            fromEp ? `chapters ${fromEp[0]} to ${fromEp[1]}` : "no match"
          }
        >
          → {fromEp ? `chapters ${fromEp[0]}–${fromEp[1]}` : "—"}
        </Text>
      </View>
      <View style={styles.lookupRow}>
        <Text style={styles.lookupLabel}>I finished chapter</Text>
        <TextInput
          value={chInput}
          onChangeText={setChInput}
          keyboardType="number-pad"
          style={styles.lookupInput}
          placeholder="e.g. 38"
          accessibilityLabel="I finished chapter"
          placeholderTextColor={COLOR.textFaint}
        />
        <Text
          style={styles.lookupResult}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            fromCh
              ? `episodes ${fromCh[0]} to ${fromCh[1]}${seasonSpoken}`
              : "no match"
          }
        >
          → {fromCh ? `episodes ${fromCh[0]}–${fromCh[1]}` : "—"}
          {seasonSuffix}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lookup: { gap: 12, paddingTop: 8 },
  sectionTitle: {
    color: COLOR.textPrimary,
    fontSize: 18,
    paddingTop: 10,
    letterSpacing: -0.3,
    fontFamily: FONT.bold,
  },
  lookupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  lookupLabel: {
    color: COLOR.textSecondary,
    fontSize: 13,
    fontFamily: FONT.medium,
  },
  lookupInput: {
    backgroundColor: COLOR.surface,
    color: COLOR.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 80,
    fontFamily: FONT.regular,
  },
  lookupResult: { color: COLOR.accent, fontSize: 13, fontFamily: FONT.bold },
});
