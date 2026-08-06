import { StyleSheet, Text, View } from "react-native";
import type { MangaDexTitle } from "@/types";
import { localeLabel } from "@/data/format";
import { COLOR, FONT } from "@/theme";

export function TitlesList({ titles }: { titles: MangaDexTitle[] }) {
  if (titles.length <= 1) return null;

  return (
    <View style={styles.titlesBlock}>
      <Text style={styles.sectionTitle}>Titles &amp; translations</Text>
      <View style={styles.titlesList}>
        {titles.map((t, idx) => (
          <View key={`${t.locale}-${idx}`} style={styles.titleRow}>
            <Text style={styles.titleLocale}>{localeLabel(t.locale)}</Text>
            <Text style={styles.titleValue}>{t.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: COLOR.textPrimary,
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  titlesBlock: { gap: 8 },
  titlesList: { gap: 6 },
  titleRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "baseline",
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.surfaceRaised,
  },
  titleLocale: {
    color: COLOR.accent,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
    minWidth: 130,
  },
  titleValue: {
    color: COLOR.textPrimary,
    fontSize: 14,
    flex: 1,
    fontFamily: FONT.regular,
  },
});
