import { StyleSheet, Text, View } from "react-native";
import { seasonCoverage } from "@/data/mapping";
import type { SeriesMapping } from "@/types";
import { COLOR, FONT } from "@/theme";

export function SeasonCoverage({ mapping }: { mapping: SeriesMapping }) {
  const seasons = seasonCoverage(mapping);
  if (seasons.length === 0) return null;

  return (
    <View style={styles.outer}>
      <View style={styles.block}>
        <Text style={styles.label}>Per-season chapter coverage</Text>
        {seasons.map(({ label, episodes, chapters }) => (
          <View key={label} style={styles.row}>
            <Text style={styles.name}>{label}</Text>
            <Text style={styles.meta}>
              Eps {episodes[0]}–{episodes[1]} · Ch {chapters[0]}–{chapters[1]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingTop: 4 },
  block: {
    padding: 12,
    backgroundColor: COLOR.surface,
    gap: 6,
  },
  label: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
  },
  name: {
    color: COLOR.textPrimary,
    fontSize: 14,
    fontFamily: FONT.semibold,
  },
  meta: {
    color: COLOR.textSecondary,
    fontSize: 12,
    fontFamily: FONT.regular,
  },
});
