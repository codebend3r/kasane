import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCatalog } from "@/data/catalog";
import {
  sortMappedShows,
  toMappedShow,
  type MappedShow,
  type MappedShowSort,
} from "@/data/mappedShows";
import { useAuthEmail, useAuthStatus } from "@/state/auth";
import { useInProgressEntries } from "@/state/progress";
import { MENU_SECTIONS, useSideMenu, type MenuSection } from "@/state/sideMenu";
import { MOBILE_WIDTH_BREAKPOINT } from "@/components/CoverCarousel";
import type { PressableState } from "@/types";
import { FONT } from "@/theme";

const PANEL_MAX_WIDTH = 460;
const SLIDE_MS = 220;

/**
 * Sliding drawer holding the catalog browser, the viewer's tracked shows, and
 * settings. On phones it takes almost the full width; on wider screens it caps
 * at `PANEL_MAX_WIDTH` and leaves the page visible behind the scrim.
 */
export function SideMenu() {
  const open = useSideMenu((s) => s.open);
  const close = useSideMenu((s) => s.close);
  const section = useSideMenu((s) => s.section);
  const setSection = useSideMenu((s) => s.setSection);
  const { width } = useWindowDimensions();

  const isMobile = width < MOBILE_WIDTH_BREAKPOINT;
  const panelWidth = isMobile
    ? Math.min(width * 0.88, PANEL_MAX_WIDTH)
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
          style={StyleSheet.absoluteFill}
          onPress={close}
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
          <Text style={styles.panelTitle}>Browse</Text>
          <Pressable
            onPress={close}
            hitSlop={10}
            style={({ hovered, pressed }: PressableState) => [
              { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {MENU_SECTIONS.map((s) => (
            <SectionTab
              key={s.id}
              label={s.label}
              active={section === s.id}
              onPress={() => setSection(s.id)}
            />
          ))}
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          <SectionBody section={section} onNavigate={close} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function SectionTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: PressableState) => [
        styles.tab,
        active && styles.tabActive,
        { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionBody({
  section,
  onNavigate,
}: {
  section: MenuSection;
  onNavigate: () => void;
}) {
  if (section === "mapped")
    return <MappedShowsSection onNavigate={onNavigate} />;
  if (section === "myShows") return <MyShowsSection onNavigate={onNavigate} />;
  return <SettingsSection />;
}

function MappedShowsSection({ onNavigate }: { onNavigate: () => void }) {
  const { mappings, isLoaded } = useCatalog();
  const [sort, setSort] = useState<MappedShowSort>("alpha");

  const shows = useMemo(
    () => sortMappedShows(mappings.map(toMappedShow), sort),
    [mappings, sort],
  );

  return (
    <View style={styles.section}>
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>
          {shows.length} {shows.length === 1 ? "show" : "shows"}
        </Text>
        <View style={styles.sortButtons}>
          <SortButton
            label="A–Z"
            active={sort === "alpha"}
            onPress={() => setSort("alpha")}
          />
          <SortButton
            label="Episodes"
            active={sort === "episodes"}
            onPress={() => setSort("episodes")}
          />
        </View>
      </View>

      {!isLoaded && shows.length === 0 ? (
        <Text style={styles.muted}>Loading the catalog…</Text>
      ) : (
        <View style={styles.grid}>
          {shows.map((s) => (
            <ShowTile key={s.routeId} show={s} onNavigate={onNavigate} />
          ))}
        </View>
      )}
    </View>
  );
}

function ShowTile({
  show,
  onNavigate,
  trailing,
}: {
  show: MappedShow;
  onNavigate: () => void;
  trailing?: string;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        onNavigate();
        router.push(`/series/${show.routeId}`);
      }}
      style={({ hovered, pressed }: PressableState) => [
        styles.tile,
        { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
      ]}
    >
      <Text style={styles.tileTitle} numberOfLines={2}>
        {show.title}
      </Text>
      <Text style={styles.tileMeta}>
        {show.episodes > 0 ? `${show.episodes} eps` : "Manga only"}
        {" · "}
        {show.chapters} ch
      </Text>
      {!!trailing && <Text style={styles.tileTrailing}>{trailing}</Text>}
    </Pressable>
  );
}

function SortButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: PressableState) => [
        styles.sortButton,
        active && styles.sortButtonActive,
        { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.sortText, active && styles.sortTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MyShowsSection({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const status = useAuthStatus();
  const email = useAuthEmail();
  const entries = useInProgressEntries();
  const { findMapping } = useCatalog();

  const shows = useMemo(
    () =>
      entries.flatMap((e) => {
        const mapping = findMapping(e.routeId);
        if (!mapping) return [];
        const anime = e.progress.anime?.position;
        const manga = e.progress.manga?.position;
        const trailing = [
          typeof anime === "number" ? `ep ${anime}` : null,
          typeof manga === "number" ? `ch ${manga}` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return [{ show: toMappedShow(mapping), trailing }];
      }),
    [entries, findMapping],
  );

  return (
    <View style={styles.section}>
      {status !== "signedIn" && (
        <View style={styles.signInCallout}>
          <Text style={styles.calloutEyebrow}>Not signed in</Text>
          <Text style={styles.calloutTitle}>
            These shows live only on this device
          </Text>
          <Text style={styles.calloutBody}>
            Sign in to save what you&rsquo;re watching to your account. Without
            an account this list is lost when you clear your browser data, and
            it won&rsquo;t follow you to another device.
          </Text>
          <Pressable
            onPress={() => {
              onNavigate();
              router.push("/login");
            }}
            style={({ hovered, pressed }: PressableState) => [
              styles.calloutButton,
              { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.calloutButtonText}>Sign in to save</Text>
          </Pressable>
        </View>
      )}

      {status === "signedIn" && !!email && (
        <Text style={styles.syncedNote}>Synced to {email}</Text>
      )}

      {shows.length === 0 ? (
        <Text style={styles.muted}>
          Nothing tracked yet. Tap an arc on any series to mark your progress
          and it will show up here.
        </Text>
      ) : (
        <View style={styles.grid}>
          {shows.map(({ show, trailing }) => (
            <ShowTile
              key={show.routeId}
              show={show}
              trailing={trailing}
              onNavigate={onNavigate}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function SettingsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.muted}>Settings are coming soon.</Text>
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
    backgroundColor: "#000000cc",
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#0f1013",
    borderRightWidth: 1,
    borderRightColor: "#22242a",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  panelTitle: {
    color: "#f5f5f5",
    fontSize: 20,
    letterSpacing: -0.3,
    fontFamily: FONT.bold,
  },
  close: { color: "#9aa0a6", fontSize: 18, fontFamily: FONT.bold },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#17181b",
  },
  tabActive: { backgroundColor: "#7c5cff" },
  tabText: {
    color: "#9aa0a6",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  tabTextActive: { color: "#0c0c0e" },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingTop: 8 },
  section: { gap: 16 },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sortLabel: {
    color: "#6b7177",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  sortButtons: { flexDirection: "row", gap: 8 },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#17181b",
  },
  sortButtonActive: { backgroundColor: "#7c5cff" },
  sortText: {
    color: "#9aa0a6",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  sortTextActive: { color: "#0c0c0e" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: {
    flexGrow: 1,
    flexBasis: 180,
    gap: 4,
    padding: 12,
    backgroundColor: "#17181b",
    borderLeftWidth: 3,
    borderLeftColor: "#7c5cff",
  },
  tileTitle: { color: "#f5f5f5", fontSize: 14, fontFamily: FONT.semibold },
  tileMeta: { color: "#6b7177", fontSize: 12, fontFamily: FONT.medium },
  tileTrailing: { color: "#5cff9d", fontSize: 12, fontFamily: FONT.bold },
  muted: {
    color: "#6b7177",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.regular,
  },
  signInCallout: {
    gap: 10,
    padding: 16,
    backgroundColor: "#1b1524",
    borderLeftWidth: 4,
    borderLeftColor: "#ff7c5c",
  },
  calloutEyebrow: {
    color: "#ff7c5c",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  calloutTitle: { color: "#f5f5f5", fontSize: 16, fontFamily: FONT.bold },
  calloutBody: {
    color: "#cfd2d6",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT.regular,
  },
  calloutButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ff7c5c",
  },
  calloutButtonText: {
    color: "#0c0c0e",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  syncedNote: { color: "#5cff9d", fontSize: 13, fontFamily: FONT.medium },
});
