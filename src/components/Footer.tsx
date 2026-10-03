import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { version } from "@pkg";
import { COLOR, pressFeedback, FOOTER_OFFSET, SPACE, TEXT } from "@/theme";

export function Footer() {
  return (
    <View style={styles.bar}>
      <Text style={styles.copy}>Built by</Text>
      <Pressable
        onPress={() => Linking.openURL("https://github.com/codebend3r")}
        hitSlop={6}
        accessibilityRole="link"
        accessibilityLabel="CJ Rivas on GitHub"
        style={(state) => [pressFeedback(state)]}
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
        style={(state) => [pressFeedback(state)]}
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
    gap: SPACE.md,
    paddingHorizontal: SPACE.xl,
    paddingTop: FOOTER_OFFSET,
    paddingBottom: SPACE.xxl,
    borderTopWidth: 1,
    borderTopColor: COLOR.surface,
  },
  copy: { ...TEXT.buttonLabel, color: COLOR.textMuted },
  link: { ...TEXT.buttonLabel, color: COLOR.textPrimary },
  spacer: { flex: 1 },
  version: { ...TEXT.buttonLabel, color: COLOR.textMuted },
  github: { ...TEXT.buttonLabel, color: COLOR.accent },
});
