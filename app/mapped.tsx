import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCatalog } from "@/data/catalog";
import {
  sortMappedShows,
  toMappedShow,
  type MappedShowSort,
} from "@/data/mappedShows";
import { ShowTile } from "@/components/ShowTile";
import { Footer } from "@/components/Footer";
import type { PressableState } from "@/types";
import { Pressable } from "react-native";
import { FONT } from "@/theme";

export default function MappedShowsScreen() {
  const { mappings, isLoaded } = useCatalog();
  const [sort, setSort] = useState<MappedShowSort>("alpha");

  const shows = useMemo(
    () => sortMappedShows(mappings.map(toMappedShow), sort),
    [mappings, sort],
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Catalog</Text>
      <Text style={styles.title}>All mapped series</Text>
      <Text style={styles.blurb}>
        Every series kasane has an episode ↔ chapter map for.
      </Text>

      <View style={styles.sortRow}>
        <Text style={styles.count}>
          {shows.length} {shows.length === 1 ? "series" : "series"}
        </Text>
        <View style={styles.sortButtons}>
          <SortButton
            label="A–Z"
            active={sort === "alpha"}
            onPress={() => setSort("alpha")}
          />
          <SortButton
            label="Episodes"
            active={sort === "episodes"}
            onPress={() => setSort("episodes")}
          />
        </View>
      </View>

      {!isLoaded && shows.length === 0 ? (
        <Text style={styles.muted}>Loading the catalog…</Text>
      ) : (
        <View style={styles.grid}>
          {shows.map((s) => (
            <ShowTile key={s.key} show={s} />
          ))}
        </View>
      )}
      <Footer />
    </ScrollView>
  );
}

function SortButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: PressableState) => [
        styles.sortButton,
        active && styles.sortButtonActive,
        { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.sortText, active && styles.sortTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 40 },
  eyebrow: {
    color: "#7c5cff",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 24,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  blurb: { color: "#9aa0a6", fontSize: 14, fontFamily: FONT.regular },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 4,
  },
  count: {
    color: "#6b7177",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  sortButtons: { flexDirection: "row", gap: 8 },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#17181b",
  },
  sortButtonActive: { backgroundColor: "#7c5cff" },
  sortText: {
    color: "#9aa0a6",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  sortTextActive: { color: "#0c0c0e" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  muted: { color: "#6b7177", fontSize: 14, fontFamily: FONT.regular },
});
