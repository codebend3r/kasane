import { StyleSheet, Text, View } from "react-native";
import { seasonCoverage } from "@/data/mapping";
import type { SeriesMapping } from "@/types";
import { COLOR, FONT, SPACE } from "@/theme";

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
  outer: { paddingTop: SPACE.xs },
  block: {
    padding: SPACE.lg,
    backgroundColor: COLOR.surface,
    gap: SPACE.sm,
  },
  label: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
    paddingBottom: SPACE.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: SPACE.lg,
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
