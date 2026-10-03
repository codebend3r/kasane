import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useIsNarrow } from "@/components/useIsNarrow";
import { useAuthEmail } from "@/state/auth";
import { usePreferences } from "@/state/preferences";
import { useSideMenu } from "@/state/sideMenu";
import { COLOR, FONT, pressFeedback, SPACE } from "@/theme";

/**
 * The bar above every screen: menu, back, wordmark, the title-language toggle
 * and the account chip.
 */
export function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  // The header packs six controls into one row; at phone widths the default
  // gaps push it past the viewport, so tighten the spacing rather than let the
  // page scroll sideways.
  const isNarrow = useIsNarrow();
  const japanese = usePreferences((s) => s.japanese);
  const toggleJapanese = usePreferences((s) => s.toggleJapanese);
  const email = useAuthEmail();

  const openMenu = useSideMenu((s) => s.openMenu);

  return (
    <View style={[styles.bar, isNarrow && styles.barNarrow]}>
      <Pressable
        onPress={() => openMenu()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        style={(state) => [styles.menuButton, pressFeedback(state)]}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>
      {!isHome && (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={(state) => [styles.back, pressFeedback(state)]}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
      )}
      <Pressable
        onPress={() => router.replace("/")}
        hitSlop={8}
        accessibilityRole="link"
        accessibilityLabel="Kasane, go to home"
        style={(state) => [styles.wordmarkPressable, pressFeedback(state)]}
      >
        <Text
          numberOfLines={1}
          style={[styles.wordmark, isNarrow && styles.wordmarkNarrow]}
        >
          Kasane
        </Text>
        {/* The wide-tracked subheading is what pushes the header past a phone
            viewport once the back arrow is present, so drop it when narrow. */}
        {!isNarrow && (
          <>
            <Text style={styles.subheading}>
              anime <Text style={styles.subAccent}>+</Text> manga
            </Text>
            <View style={styles.rule} />
          </>
        )}
      </Pressable>
      <View style={styles.spacer} />
      <Pressable
        onPress={toggleJapanese}
        accessibilityRole="switch"
        accessibilityLabel="Show titles in Japanese"
        accessibilityState={{ checked: japanese }}
        style={(state) => [styles.langToggle, pressFeedback(state)]}
      >
        <Text style={styles.langToggleText}>{japanese ? "JP" : "EN"}</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/login")}
        accessibilityRole="link"
        accessibilityLabel={
          email ? `Account, signed in as ${email}` : "Sign in"
        }
        style={(state) => [styles.accountPill, pressFeedback(state)]}
      >
        <Text style={styles.accountPillText}>
          {email ? email.charAt(0).toUpperCase() : "Sign in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.xl,
    paddingHorizontal: SPACE.xl,
    paddingTop: SPACE.xxxl,
    paddingBottom: SPACE.lg,
  },
  barNarrow: { gap: SPACE.md, paddingHorizontal: SPACE.mdl },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: { paddingVertical: SPACE.xxs, paddingHorizontal: SPACE.xxs },
  menuIcon: { color: COLOR.textPrimary, fontSize: 20, fontFamily: FONT.bold },
  backArrow: {
    color: COLOR.accent,
    fontSize: 32,
    fontFamily: FONT.bold,
    lineHeight: 32,
  },
  wordmarkPressable: {
    gap: SPACE.xs,
    flexShrink: 1,
  },
  // Scaled down rather than allowed to shrink-wrap, which broke "Kasane"
  // across two lines on a phone.
  wordmarkNarrow: { fontSize: 34, lineHeight: 38, letterSpacing: -1 },
  wordmark: {
    color: COLOR.textPrimary,
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    fontFamily: FONT.display,
    paddingBottom: SPACE.xxs,
  },
  subheading: {
    color: COLOR.textSecondary,
    fontSize: 13,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
    paddingBottom: SPACE.sm,
  },
  subAccent: {
    color: COLOR.accent,
    fontFamily: FONT.bold,
  },
  rule: {
    height: 4,
    width: 64,
    backgroundColor: COLOR.accent,
  },
  spacer: { flex: 1 },
  langToggle: {
    paddingHorizontal: SPACE.lgx,
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.md,
    backgroundColor: COLOR.accent,
    alignSelf: "flex-start",
  },
  langToggleText: {
    color: COLOR.background,
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: FONT.bold,
  },
  accountPill: {
    paddingHorizontal: SPACE.lgx,
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.md,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 2,
    borderLeftColor: COLOR.accent,
    alignSelf: "flex-start",
  },
  accountPillText: {
    color: COLOR.accent,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
});
