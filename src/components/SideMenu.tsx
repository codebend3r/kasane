import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MENU_LINKS, useSideMenu } from "@/state/sideMenu";
import { MOBILE_WIDTH_BREAKPOINT } from "@/components/CoverCarousel";
import type { PressableState } from "@/types";
import { COLOR, FONT } from "@/theme";

const PANEL_MAX_WIDTH = 320;
const SLIDE_MS = 220;

/**
 * Navigation drawer. It only lists links — each destination is a real route, so
 * pages are linkable, back/forward works, and the drawer holds no screen state.
 */
export function SideMenu() {
  const open = useSideMenu((s) => s.open);
  const close = useSideMenu((s) => s.close);
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const isMobile = width < MOBILE_WIDTH_BREAKPOINT;
  const panelWidth = isMobile
    ? Math.min(width * 0.82, PANEL_MAX_WIDTH)
    : PANEL_MAX_WIDTH;

  // Kept mounted through the closing animation so the panel slides out rather
  // than vanishing.
  const [mounted, setMounted] = useState(open);
  const slide = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    if (open) setMounted(true);
    Animated.timing(slide, {
      toValue: open ? 1 : 0,
      duration: SLIDE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, slide]);

  if (!mounted) return null;

  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-panelWidth, 0],
  });

  return (
    <View style={styles.overlayRoot}>
      <Animated.View style={[styles.scrim, { opacity: slide }]}>
        <Pressable
          style={styles.scrimPress}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          { width: panelWidth, transform: [{ translateX }] },
        ]}
      >
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Menu</Text>
          <Pressable
            onPress={close}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            style={({ hovered, pressed }: PressableState) => [
              { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.links}>
          {MENU_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Pressable
                key={link.href}
                onPress={() => {
                  close();
                  router.push(link.href);
                }}
                accessibilityRole="link"
                accessibilityLabel={link.label}
                accessibilityState={{ selected: active }}
                style={({ hovered, pressed }: PressableState) => [
                  styles.link,
                  active && styles.linkActive,
                  { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
                ]}
              >
                <Text
                  style={[styles.linkLabel, active && styles.linkLabelActive]}
                >
                  {link.label}
                </Text>
                <Text style={styles.linkHint}>{link.hint}</Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLOR.scrim,
  },
  scrimPress: { flex: 1 },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLOR.surfaceSubtle,
    borderRightWidth: 1,
    borderRightColor: COLOR.borderSubtle,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  panelTitle: {
    color: COLOR.textPrimary,
    fontSize: 20,
    letterSpacing: -0.3,
    fontFamily: FONT.bold,
  },
  close: { color: COLOR.textMuted, fontSize: 18, fontFamily: FONT.bold },
  links: { gap: 4, paddingHorizontal: 12 },
  link: {
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  linkActive: { backgroundColor: COLOR.surface, borderLeftColor: COLOR.accent },
  linkLabel: {
    color: COLOR.textPrimary,
    fontSize: 15,
    fontFamily: FONT.semibold,
  },
  linkLabelActive: { color: COLOR.accent },
  linkHint: { color: COLOR.textMuted, fontSize: 12, fontFamily: FONT.regular },
});
