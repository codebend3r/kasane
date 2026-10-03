import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCatalog } from "@/queries/catalog";
import {
  DEFAULT_SORT,
  nextSort,
  sortMappedShows,
  toMappedShow,
  type MappedShowSort,
  type MappedShowSortField,
} from "@/data/mappedShows";
import { useCovers } from "@/queries/covers";
import { ShowGrid } from "@/components/ShowGrid";
import { ShowRow } from "@/components/ShowRow";
import { Footer } from "@/components/Footer";
import { Pressable } from "react-native";
import { COLOR, FONT, pressFeedback, SPACE, TEXT } from "@/theme";

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
      style={(state) => [
        styles.sortButton,
        active && styles.sortButtonActive,
        pressFeedback(state),
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
      style={(state) => [
        styles.viewButton,
        active && styles.viewButtonActive,
        pressFeedback(state),
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
  content: { gap: SPACE.lg, padding: SPACE.xl, paddingBottom: SPACE.pageEnd },
  eyebrow: { ...TEXT.eyebrow, color: COLOR.accent },
  title: { ...TEXT.pageTitle, color: COLOR.textPrimary },
  blurb: { color: COLOR.textMuted, fontSize: 14, fontFamily: FONT.regular },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACE.lg,
    paddingTop: SPACE.xs,
  },
  count: { ...TEXT.chipLabel, color: COLOR.textMuted },
  // Shrinkable so the four controls wrap onto a second line on a phone
  // instead of running off the edge of the viewport.
  sortButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flexShrink: 1,
    gap: SPACE.md,
  },
  sortButton: {
    paddingHorizontal: SPACE.lgx,
    paddingVertical: SPACE.sm,
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
  viewToggle: { flexDirection: "row", gap: SPACE.xxs, paddingLeft: SPACE.md },
  viewButton: {
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.sm,
    backgroundColor: COLOR.surface,
  },
  viewButtonActive: { backgroundColor: COLOR.highlight },
  list: { gap: SPACE.xs },
  muted: { color: COLOR.textMuted, fontSize: 14, fontFamily: FONT.regular },
});
