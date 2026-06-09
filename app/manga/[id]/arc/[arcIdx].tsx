import { useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { findMappingByMediaId } from "@/data";
import { ArcDetailView } from "@/components/ArcDetailView";
import { FONT } from "@/theme";

export default function MangaArcDetail() {
  const { id, arcIdx } = useLocalSearchParams<{ id: string; arcIdx: string }>();
  const mediaId = Number(id);
  const arcIndex = Number(arcIdx);

  const mapping = useMemo(() => findMappingByMediaId(mediaId), [mediaId]);

  if (!mapping) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Mapping not found.</Text>
      </View>
    );
  }

  return <ArcDetailView mapping={mapping} arcIndex={arcIndex} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: "#9aa0a6", fontFamily: FONT.regular },
});
