import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCatalog } from "@/data/catalog";
import { ArcDetailView } from "@/components/ArcDetailView";
import { FONT } from "@/theme";

export default function AnimeArcDetail() {
  const { id, arcIdx } = useLocalSearchParams<{ id: string; arcIdx: string }>();
  const mediaId = Number(id);
  const arcIndex = Number(arcIdx);

  const { findMapping, isLoaded } = useCatalog();
  const mapping = findMapping(mediaId);

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c5cff" />
      </View>
    );
  }

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
