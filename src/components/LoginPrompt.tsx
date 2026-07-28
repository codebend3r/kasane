import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useLoginPrompt } from "@/state/loginPrompt";
import type { PressableState } from "@/types";
import { FONT } from "@/theme";

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
    backgroundColor: "#17181b",
    borderLeftWidth: 4,
    borderLeftColor: "#7c5cff",
  },
  eyebrow: {
    color: "#7c5cff",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  body: {
    color: "#cfd2d6",
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
    backgroundColor: "#7c5cff",
  },
  primaryText: {
    color: "#0c0c0e",
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
    color: "#9aa0a6",
    fontSize: 13,
    fontFamily: FONT.medium,
  },
});
