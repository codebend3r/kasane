import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { CATALOG_QUERY_KEY, useCatalogQuery } from "@/queries/catalog";
import { COVERS_QUERY_KEY } from "@/queries/covers";
import { MINUTE_MS, WEEK_MS } from "@/queries/shared";
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { ZenTokyoZoo_400Regular } from "@expo-google-fonts/zen-tokyo-zoo";
import { usePreferences } from "@/state/preferences";
import { useAuthEmail } from "@/state/auth";
import { startCloudSync } from "@/state/sync";
import { startLoginPrompt } from "@/state/loginPrompt";
import { LoginPrompt } from "@/components/LoginPrompt";
import { useSideMenu } from "@/state/sideMenu";
import { SideMenu } from "@/components/SideMenu";
import { MOBILE_WIDTH_BREAKPOINT } from "@/components/CoverCarousel";
import { COLOR, FONT, pressFeedback } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Reconcile local progress/preferences with Supabase once a session exists.
startCloudSync();

// Nudge signed-out users to log in the first time they change something.
startLoginPrompt();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * MINUTE_MS, retry: 1 },
  },
});

// Persist the catalog and its poster art to AsyncStorage so a cold (or
// offline) launch renders the anime<->manga mappings instantly, then refreshes
// in the background. Other AniList/MangaDex results stay in-memory only.
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "kasane-query-cache",
});
const PERSISTED_QUERIES: readonly string[] = [
  CATALOG_QUERY_KEY[0],
  COVERS_QUERY_KEY[0],
];

// Warms the catalog at launch so it is ready before the first screen needs a
// mapping or a search needs its aliases.
function CatalogWarmup() {
  useCatalogQuery();
  return null;
}

function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  // The header packs six controls into one row; at phone widths the default
  // gaps push it past the viewport, so tighten the spacing rather than let the
  // page scroll sideways.
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth < MOBILE_WIDTH_BREAKPOINT;
  const japanese = usePreferences((s) => s.japanese);
  const toggleJapanese = usePreferences((s) => s.toggleJapanese);
  const email = useAuthEmail();

  const openMenu = useSideMenu((s) => s.openMenu);

  return (
    <View style={[headerStyles.bar, isNarrow && headerStyles.barNarrow]}>
      <Pressable
        onPress={() => openMenu()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        style={(state) => [headerStyles.menuButton, pressFeedback(state)]}
      >
        <Text style={headerStyles.menuIcon}>☰</Text>
      </Pressable>
      {!isHome && (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={(state) => [headerStyles.back, pressFeedback(state)]}
        >
          <Text style={headerStyles.backArrow}>←</Text>
        </Pressable>
      )}
      <Pressable
        onPress={() => router.replace("/")}
        hitSlop={8}
        accessibilityRole="link"
        accessibilityLabel="Kasane, go to home"
        style={(state) => [
          headerStyles.wordmarkPressable,
          pressFeedback(state),
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            headerStyles.wordmark,
            isNarrow && headerStyles.wordmarkNarrow,
          ]}
        >
          Kasane
        </Text>
        {/* The wide-tracked subheading is what pushes the header past a phone
            viewport once the back arrow is present, so drop it when narrow. */}
        {!isNarrow && (
          <>
            <Text style={headerStyles.subheading}>
              anime <Text style={headerStyles.subAccent}>+</Text> manga
            </Text>
            <View style={headerStyles.rule} />
          </>
        )}
      </Pressable>
      <View style={headerStyles.spacer} />
      <Pressable
        onPress={toggleJapanese}
        accessibilityRole="switch"
        accessibilityLabel="Show titles in Japanese"
        accessibilityState={{ checked: japanese }}
        style={(state) => [headerStyles.langToggle, pressFeedback(state)]}
      >
        <Text style={headerStyles.langToggleText}>
          {japanese ? "JP" : "EN"}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/login")}
        accessibilityRole="link"
        accessibilityLabel={
          email ? `Account, signed in as ${email}` : "Sign in"
        }
        style={(state) => [headerStyles.accountPill, pressFeedback(state)]}
      >
        <Text style={headerStyles.accountPillText}>
          {email ? email.charAt(0).toUpperCase() : "Sign in"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    ZenTokyoZoo_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: WEEK_MS,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) &&
            PERSISTED_QUERIES.some((k) => k === query.queryKey[0]),
        },
      }}
    >
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={headerStyles.root}>
          <CatalogWarmup />
          <GlobalHeader />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLOR.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="mapped" />
            <Stack.Screen name="my-shows" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="anime/[id]/index" />
            <Stack.Screen name="anime/[id]/arc/[arcIdx]" />
            <Stack.Screen name="manga/[id]/index" />
            <Stack.Screen name="manga/[id]/arc/[arcIdx]" />
            <Stack.Screen name="series/[id]/index" />
          </Stack>
          <LoginPrompt />
          <SideMenu />
        </View>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

const headerStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.background },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  barNarrow: { gap: 8, paddingHorizontal: 10 },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: { paddingVertical: 2, paddingHorizontal: 2 },
  menuIcon: { color: COLOR.textPrimary, fontSize: 20, fontFamily: FONT.bold },
  backArrow: {
    color: COLOR.accent,
    fontSize: 32,
    fontFamily: FONT.bold,
    lineHeight: 32,
  },
  wordmarkPressable: {
    gap: 4,
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
    paddingBottom: 2,
  },
  subheading: {
    color: COLOR.textSecondary,
    fontSize: 13,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
    paddingBottom: 6,
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
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
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
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
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
