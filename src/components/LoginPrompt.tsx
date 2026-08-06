import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useLoginPrompt } from "@/state/loginPrompt";
import type { PressableState } from "@/types";
import { COLOR, FONT } from "@/theme";

/**
 * Bottom-right toaster reminding signed-out users to log in so their progress
 * and preferences sync. Rendered above the router stack so it floats over every
 * screen.
 */
export function LoginPrompt() {
  const router = useRouter();
  const visible = useLoginPrompt((s) => s.visible);
  const dismiss = useLoginPrompt((s) => s.dismiss);

  if (!visible) return null;

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <View style={styles.toast}>
        <Text style={styles.eyebrow}>Saved on this device</Text>
        <Text style={styles.body}>
          Log in to save your progress and settings to your account and pick up
          where you left off anywhere.
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              dismiss();
              router.push("/login");
            }}
            accessibilityRole="link"
            accessibilityLabel="Log in"
            style={({ hovered, pressed }: PressableState) => [
              styles.primary,
              { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.primaryText}>Log in</Text>
          </Pressable>
          <Pressable
            onPress={dismiss}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Dismiss the log in prompt"
            style={({ hovered, pressed }: PressableState) => [
              styles.secondary,
              { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.secondaryText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    right: 0,
    bottom: 0,
    padding: 16,
    alignItems: "flex-end",
  },
  toast: {
    maxWidth: 340,
    gap: 10,
    padding: 16,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.accent,
  },
  eyebrow: {
    color: COLOR.accent,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  body: {
    color: COLOR.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.regular,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 2,
  },
  primary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLOR.accent,
  },
  primaryText: {
    color: COLOR.background,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  secondary: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  secondaryText: {
    color: COLOR.textMuted,
    fontSize: 13,
    fontFamily: FONT.medium,
  },
});
