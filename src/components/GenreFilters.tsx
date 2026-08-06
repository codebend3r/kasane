import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PressableState } from "@/types";
import type { GenreFilter } from "@/data/genreFilters";
import { COLOR, FONT } from "@/theme";

type GenreFiltersProps = {
  filters: readonly GenreFilter[];
  hiddenGenres: string[];
  onToggle: (id: string) => void;
  onSetHidden: (ids: string[]) => void;
  /** Phone widths get a bottom sheet; wider viewports get an inline chip row. */
  isMobile: boolean;
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export function GenreFilters({
  filters,
  hiddenGenres,
  onToggle,
  onSetHidden,
  isMobile,
  open,
  onOpenChange,
}: GenreFiltersProps) {
  const hiddenCount = hiddenGenres.length;

  return (
    <>
      <Pressable
        onPress={() => onOpenChange(!open)}
        accessibilityRole="button"
        accessibilityLabel="Filter genres"
        accessibilityState={{ expanded: open }}
        style={({ hovered, pressed }: PressableState) => [
          styles.filterToggle,
          { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.filterToggleText}>
          {hiddenCount > 0
            ? `Filter genres · ${hiddenCount} hidden`
            : "Filter genres"}
        </Text>
        <Text style={styles.filterToggleChevron}>
          {open && !isMobile ? "▴" : "▾"}
        </Text>
      </Pressable>

      {!isMobile && open && (
        <View style={styles.genreFilters}>
          <ToggleAllGenres
            filters={filters}
            hiddenGenres={hiddenGenres}
            onSetHidden={onSetHidden}
          />
          {filters.map((f) => {
            const included = !hiddenGenres.includes(f.id);
            return (
              <Pressable
                key={f.id}
                onPress={() => onToggle(f.id)}
                accessibilityRole="switch"
                accessibilityLabel={`Show ${f.label}`}
                accessibilityState={{ checked: included }}
                style={[styles.filterChip, included && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterText,
                    included && styles.filterTextActive,
                  ]}
                >
                  {included ? f.label : `× ${f.label}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {isMobile && (
        <GenreFilterSheet
          visible={open}
          filters={filters}
          hiddenGenres={hiddenGenres}
          onToggle={onToggle}
          onClose={() => onOpenChange(false)}
        />
      )}
    </>
  );
}

function ToggleAllGenres({
  filters,
  hiddenGenres,
  onSetHidden,
}: {
  filters: readonly GenreFilter[];
  hiddenGenres: string[];
  onSetHidden: (ids: string[]) => void;
}) {
  const allHidden = filters.length > 0 && hiddenGenres.length >= filters.length;
  return (
    <Pressable
      onPress={() => onSetHidden(allHidden ? [] : filters.map((f) => f.id))}
      accessibilityRole="button"
      accessibilityLabel={allHidden ? "Show all genres" : "Hide all genres"}
      style={({ hovered, pressed }: PressableState) => [
        styles.toggleAllChip,
        { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
      ]}
    >
      <Text style={styles.toggleAllText}>
        {allHidden ? "Show all" : "Hide all"}
      </Text>
    </Pressable>
  );
}

function GenreFilterSheet({
  visible,
  filters,
  hiddenGenres,
  onToggle,
  onClose,
}: {
  visible: boolean;
  filters: readonly GenreFilter[];
  hiddenGenres: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetBackdrop}>
        <Pressable
          style={styles.sheetBackdropFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close the genre filters"
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter genres</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Done filtering genres"
              style={({ pressed }: PressableState) => [
                styles.sheetDone,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.sheetDoneText}>Done</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
          >
            {filters.map((f) => {
              const included = !hiddenGenres.includes(f.id);
              return (
                <Pressable
                  key={f.id}
                  onPress={() => onToggle(f.id)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Show ${f.label}`}
                  accessibilityState={{ checked: included }}
                  style={({ pressed }: PressableState) => [
                    styles.sheetRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View
                    style={[
                      styles.sheetCheckbox,
                      included && styles.sheetCheckboxOn,
                    ]}
                  >
                    {included && <Text style={styles.sheetCheckMark}>✓</Text>}
                  </View>
                  <Text style={styles.sheetRowLabel}>{f.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  genreFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    rowGap: 8,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 2,
    borderLeftColor: COLOR.accent,
  },
  filterToggleText: {
    color: COLOR.textSecondary,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  filterToggleChevron: {
    color: COLOR.accent,
    fontSize: 12,
    lineHeight: 12,
    fontFamily: FONT.bold,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: COLOR.scrimSheet,
    justifyContent: "flex-end",
  },
  sheetBackdropFill: { flex: 1 },
  sheet: {
    backgroundColor: COLOR.surface,
    maxHeight: "75%",
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    backgroundColor: COLOR.border,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  sheetTitle: {
    flex: 1,
    color: COLOR.textPrimary,
    fontSize: 18,
    fontFamily: FONT.bold,
    letterSpacing: -0.2,
  },
  sheetDone: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLOR.accent,
  },
  sheetDoneText: {
    color: COLOR.background,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  sheetScroll: { paddingHorizontal: 20 },
  sheetScrollContent: { paddingBottom: 12, gap: 4 },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  sheetCheckbox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR.background,
    borderWidth: 2,
    borderColor: COLOR.border,
  },
  sheetCheckboxOn: {
    backgroundColor: COLOR.accent,
    borderColor: COLOR.accent,
  },
  sheetCheckMark: {
    color: COLOR.background,
    fontSize: 14,
    lineHeight: 14,
    fontFamily: FONT.bold,
  },
  sheetRowLabel: {
    color: COLOR.textPrimary,
    fontSize: 16,
    fontFamily: FONT.medium,
    letterSpacing: -0.1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLOR.surface,
  },
  filterChipActive: { backgroundColor: COLOR.accent },
  filterText: {
    color: COLOR.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  filterTextActive: { color: COLOR.background },
  toggleAllChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLOR.surface,
    borderWidth: 1,
    borderColor: COLOR.accent,
  },
  toggleAllText: {
    color: COLOR.accent,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
});
