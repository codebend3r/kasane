import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCatalog } from "@/data/catalog";
import {
  DEFAULT_SORT,
  nextSort,
  sortMappedShows,
  toMappedShow,
  type MappedShowSort,
  type MappedShowSortField,
} from "@/data/mappedShows";
import { useCovers } from "@/data/covers";
import { ShowGrid } from "@/components/ShowGrid";
import { ShowRow } from "@/components/ShowRow";
import { Footer } from "@/components/Footer";
import type { PressableState } from "@/types";
import { Pressable } from "react-native";
import { COLOR, FONT } from "@/theme";

type ViewMode = "grid" | "list";

export default function MappedShowsScreen() {
  const { mappings, isLoaded } = useCatalog();
  const [sort, setSort] = useState<MappedShowSort>(DEFAULT_SORT);
  const [view, setView] = useState<ViewMode>("grid");
  const sortBy = (field: MappedShowSortField) =>
    setSort((current) => nextSort(current, field));

  const shows = useMemo(
    () => sortMappedShows(mappings.map(toMappedShow), sort),
    [mappings, sort],
  );
  // Derived from the mappings rather than the sorted list, so re-sorting never
  // disturbs the cover query.
  const coverIds = useMemo(
    () => mappings.map((m) => m.anilistAnimeId),
    [mappings],
  );
  const covers = useCovers(coverIds);

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
            label="Title"
            field="alpha"
            sort={sort}
            onPress={sortBy}
          />
          <SortButton
            label="Episodes"
            field="episodes"
            sort={sort}
            onPress={sortBy}
          />
          <SortButton
            label="Chapters"
            field="chapters"
            sort={sort}
            onPress={sortBy}
          />
          <View style={styles.viewToggle}>
            <ViewButton
              label="Grid"
              mode="grid"
              view={view}
              onPress={setView}
            />
            <ViewButton
              label="List"
              mode="list"
              view={view}
              onPress={setView}
            />
          </View>
        </View>
      </View>

      {!isLoaded && shows.length === 0 ? (
        <Text style={styles.muted}>Loading the catalog…</Text>
      ) : view === "grid" ? (
        <ShowGrid items={shows.map((show) => ({ show }))} covers={covers} />
      ) : (
        <View style={styles.list}>
          {shows.map((s) => (
            <ShowRow key={s.key} show={s} cover={covers[s.coverId]} />
          ))}
        </View>
      )}
      <Footer />
    </ScrollView>
  );
}

/** Column-header style control: press to sort, press again to reverse. */
function SortButton({
  label,
  field,
  sort,
  onPress,
}: {
  label: string;
  field: MappedShowSortField;
  sort: MappedShowSort;
  onPress: (field: MappedShowSortField) => void;
}) {
  const active = sort.field === field;
  return (
    <Pressable
      onPress={() => onPress(field)}
      accessibilityRole="button"
      accessibilityLabel={`Sort by ${label}`}
      style={({ hovered, pressed }: PressableState) => [
        styles.sortButton,
        active && styles.sortButtonActive,
        { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.sortText, active && styles.sortTextActive]}>
        {label}
        {active ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
      </Text>
    </Pressable>
  );
}

function ViewButton({
  label,
  mode,
  view,
  onPress,
}: {
  label: string;
  mode: ViewMode;
  view: ViewMode;
  onPress: (mode: ViewMode) => void;
}) {
  const active = view === mode;
  return (
    <Pressable
      onPress={() => onPress(mode)}
      accessibilityRole="button"
      accessibilityLabel={`${label} view`}
      style={({ hovered, pressed }: PressableState) => [
        styles.viewButton,
        active && styles.viewButtonActive,
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
    color: COLOR.accent,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  title: {
    color: COLOR.textPrimary,
    fontSize: 24,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  blurb: { color: COLOR.textMuted, fontSize: 14, fontFamily: FONT.regular },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 4,
  },
  count: {
    color: COLOR.textFaint,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  // Shrinkable so the four controls wrap onto a second line on a phone
  // instead of running off the edge of the viewport.
  sortButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flexShrink: 1,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLOR.surface,
  },
  sortButtonActive: { backgroundColor: COLOR.accent },
  sortText: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  sortTextActive: { color: COLOR.background },
  // Set apart from the sort pills so the two controls do not read as one
  // group; it wraps to its own line once the row runs out of room.
  viewToggle: { flexDirection: "row", gap: 2, paddingLeft: 8 },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLOR.surface,
  },
  viewButtonActive: { backgroundColor: COLOR.highlight },
  list: { gap: 4 },
  muted: { color: COLOR.textFaint, fontSize: 14, fontFamily: FONT.regular },
});
