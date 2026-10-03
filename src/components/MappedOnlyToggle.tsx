import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLOR, FONT, pressFeedback } from "@/theme";

/** Checkbox-style switch for "only show series with a chapter map". */
export function MappedOnlyToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={6}
      accessibilityRole="checkbox"
      accessibilityLabel="Only show mapped series"
      accessibilityState={{ checked: value }}
      style={(state) => [styles.mappedToggle, pressFeedback(state)]}
    >
      <View style={[styles.checkbox, value && styles.checkboxOn]}>
        {value && <Text style={styles.checkboxMark}>✓</Text>}
      </View>
      <Text style={styles.mappedToggleText}>Mapped only</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mappedToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR.surface,
    borderWidth: 2,
    borderColor: COLOR.borderControl,
  },
  checkboxOn: { backgroundColor: COLOR.accent, borderColor: COLOR.accent },
  checkboxMark: {
    color: COLOR.background,
    fontSize: 12,
    lineHeight: 14,
    fontFamily: FONT.bold,
  },
  mappedToggleText: {
    color: COLOR.textSecondary,
    fontSize: 13,
    fontFamily: FONT.medium,
  },
});
