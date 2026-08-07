import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { version } from "@pkg";
import { COLOR, FONT } from "@/theme";
import type { PressableState } from "@/types";

export function Footer() {
  return (
    <View style={styles.bar}>
      <Text style={styles.copy}>Built by</Text>
      <Pressable
        onPress={() => Linking.openURL("https://github.com/codebend3r")}
        hitSlop={6}
        accessibilityRole="link"
        accessibilityLabel="CJ Rivas on GitHub"
        style={({ hovered, pressed }: PressableState) => [
          { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.link}>CJ Rivas</Text>
      </Pressable>
      <View style={styles.spacer} />
      <Text style={styles.version}>v{version}</Text>
      <Pressable
        onPress={() => Linking.openURL("https://github.com/codebend3r")}
        hitSlop={6}
        accessibilityRole="link"
        accessibilityLabel="Open the Kasane source on GitHub"
        style={({ hovered, pressed }: PressableState) => [
          { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.github}>GitHub →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 160,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLOR.surface,
  },
  copy: {
    color: COLOR.textMuted,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  link: {
    color: COLOR.textPrimary,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  spacer: { flex: 1 },
  version: {
    color: COLOR.textMuted,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  github: {
    color: COLOR.accent,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
});
