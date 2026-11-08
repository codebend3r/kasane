import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { HeaderWordmark } from "@/components/HeaderWordmark";
import { useIsNarrow } from "@/components/useIsNarrow";
import { useAuthEmail } from "@/state/auth";
import { useHomeChrome } from "@/state/homeChrome";
import { usePreferences } from "@/state/preferences";
import { useSideMenu } from "@/state/sideMenu";
import { COLOR, FONT, pressFeedback, SPACE } from "@/theme";

/**
 * The bar above every screen: menu, back, wordmark, the title-language toggle
 * and the account chip. While the home grid is being scrolled the bar tightens
 * and the wordmark goes compact, leaving room for covers.
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
  const compact = useHomeChrome((s) => isHome && s.immersive);
  const openMenu = useSideMenu((s) => s.openMenu);

  return (
    <View
      style={[
        styles.bar,
        isNarrow && styles.barNarrow,
        compact && styles.barCompact,
      ]}
    >
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
      <HeaderWordmark
        narrow={isNarrow}
        compact={compact}
        onPress={() => router.replace("/")}
      />
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
  barCompact: { paddingTop: SPACE.lg },
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
