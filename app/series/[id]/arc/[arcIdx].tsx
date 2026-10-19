import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSeriesMapping } from "@/queries/series";
import { ArcDetailView } from "@/components/ArcDetailView";
import { COLOR, FONT } from "@/theme";

export default function SeriesArcDetail() {
  const { id, arcIdx } = useLocalSearchParams<{ id: string; arcIdx: string }>();
  const mediaId = Number(id);
  const arcIndex = Number(arcIdx);

  const { resolved, isLoading } = useSeriesMapping(
    Number.isNaN(mediaId) ? null : mediaId,
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLOR.accent} />
      </View>
    );
  }

  if (!resolved) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Mapping not found.</Text>
      </View>
    );
  }

  return <ArcDetailView mapping={resolved.mapping} arcIndex={arcIndex} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: COLOR.textMuted, fontFamily: FONT.regular },
});
