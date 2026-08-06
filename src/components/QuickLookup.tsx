import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { SeriesMapping } from "@/types";
import { chapterToEpisodes, episodeToChapters } from "@/data";
import { COLOR, FONT } from "@/theme";

type QuickLookupProps = {
  mapping: SeriesMapping | null;
  /** Which row reads first. The anime side leads with episodes, manga with chapters. */
  lead?: "episode" | "chapter";
  /** Show the season badge beside a chapter result. Only curated mappings carry seasons. */
  showSeason?: boolean;
};

export function QuickLookup({
  mapping,
  lead = "episode",
  showSeason = false,
}: QuickLookupProps) {
  const [epInput, setEpInput] = useState("");
  const [chInput, setChInput] = useState("");

  const epNum = Number(epInput);
  const chNum = Number(chInput);

  const seasonForCh = useMemo(() => {
    if (!mapping || !chNum) return null;
    const hit = mapping.mappings.find(
      (m) => chNum >= m.chapters[0] && chNum <= m.chapters[1],
    );
    return hit?.season ?? null;
  }, [chNum, mapping]);

  if (!mapping) return null;

  const fromEp =
    !Number.isNaN(epNum) && epNum > 0
      ? episodeToChapters(mapping, epNum)
      : null;
  const fromCh =
    !Number.isNaN(chNum) && chNum > 0
      ? chapterToEpisodes(mapping, chNum)
      : null;

  const seasonSuffix = showSeason && seasonForCh ? ` (S${seasonForCh})` : "";
  const seasonSpoken =
    showSeason && seasonForCh ? `, season ${seasonForCh}` : "";

  const episodeRow = (
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
  );

  const chapterRow = (
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
  );

  return (
    <View style={styles.lookup}>
      <Text style={styles.sectionTitle}>Quick lookup</Text>
      {lead === "episode" ? episodeRow : chapterRow}
      {lead === "episode" ? chapterRow : episodeRow}
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
