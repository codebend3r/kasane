import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useLoginPrompt } from "@/state/loginPrompt";
import { COLOR, FONT, pressFeedback, SPACE, TEXT } from "@/theme";

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
            style={(state) => [styles.primary, pressFeedback(state)]}
          >
            <Text style={styles.primaryText}>Log in</Text>
          </Pressable>
          <Pressable
            onPress={dismiss}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Dismiss the log in prompt"
            style={(state) => [styles.secondary, pressFeedback(state)]}
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
    padding: SPACE.xl,
    alignItems: "flex-end",
  },
  toast: {
    maxWidth: 340,
    gap: SPACE.mdl,
    padding: SPACE.xl,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.accent,
  },
  eyebrow: { ...TEXT.eyebrow, color: COLOR.accent },
  body: {
    color: COLOR.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.regular,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.lg,
    paddingTop: SPACE.xxs,
  },
  primary: {
    paddingHorizontal: SPACE.xl,
    paddingVertical: SPACE.mdl,
    backgroundColor: COLOR.accent,
  },
  primaryText: { ...TEXT.buttonLabel, color: COLOR.background },
  secondary: {
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.mdl,
  },
  secondaryText: {
    color: COLOR.textMuted,
    fontSize: 13,
    fontFamily: FONT.medium,
  },
});
