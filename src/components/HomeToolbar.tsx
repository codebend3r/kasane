import { StyleSheet, Text, View } from "react-native";
import { GenreFilterButton, GenreFilterPanel } from "@/components/GenreFilters";
import { MappedOnlyToggle } from "@/components/MappedOnlyToggle";
import { COLOR, SPACE, TEXT } from "@/theme";

/**
 * The home screen's control row: an optional section heading on the left,
 * "Mapped only" and "Filter genres" on the right. The row wraps on a narrow
 * window, dropping the controls under the heading, and the genre chips open
 * beneath the whole row. The screen owns `filtersOpen`: the toolbar moves
 * between the search results and the latest grid, and the panel should stay
 * open across that move.
 */
export function HomeToolbar({
  heading,
  mappedOnly,
  onMappedOnlyChange,
  filtersOpen,
  onFiltersOpenChange,
}: {
  heading?: { eyebrow: string; title: string };
  mappedOnly: boolean;
  onMappedOnlyChange: (next: boolean) => void;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {!!heading && (
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>{heading.eyebrow}</Text>
            <Text style={styles.title}>{heading.title}</Text>
          </View>
        )}
        <View style={styles.controls}>
          <MappedOnlyToggle value={mappedOnly} onChange={onMappedOnlyChange} />
          <GenreFilterButton
            open={filtersOpen}
            onToggle={() => onFiltersOpenChange(!filtersOpen)}
          />
        </View>
      </View>
      <GenreFilterPanel
        open={filtersOpen}
        onClose={() => onFiltersOpenChange(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: SPACE.lg },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPACE.lg,
  },
  heading: { gap: SPACE.xxs },
  eyebrow: { ...TEXT.eyebrow, color: COLOR.accent },
  title: { ...TEXT.blockTitle, color: COLOR.textPrimary },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: SPACE.xl,
  },
});
