import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
import {
  CATALOG_QUERY_KEY,
  useCatalogQuery,
  useHydrateSearchAliases,
} from "@/data/catalog";
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
import type { PressableState } from "@/types";
import { FONT } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Reconcile local progress/preferences with Supabase once a session exists.
startCloudSync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

// Persist only the catalog query to AsyncStorage so a cold (or offline) launch
// renders the anime<->manga mappings instantly, then refreshes in the
// background. AniList/MangaDex results stay in-memory only.
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "kasane-query-cache",
});
const CATALOG_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Warms the catalog at launch and keeps the search-alias table hydrated so
// everything is ready before the first screen needs a mapping.
function CatalogWarmup() {
  useCatalogQuery();
  useHydrateSearchAliases();
  return null;
}

function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const japanese = usePreferences((s) => s.japanese);
  const toggleJapanese = usePreferences((s) => s.toggleJapanese);
  const email = useAuthEmail();

  return (
    <View style={headerStyles.bar}>
      {!isHome && (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }: any) => [
            headerStyles.back,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={headerStyles.backArrow}>←</Text>
        </Pressable>
      )}
      <Pressable
        onPress={() => router.replace("/")}
        hitSlop={8}
        style={({ hovered, pressed }: any) => [
          headerStyles.wordmarkPressable,
          { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
        ]}
      >
        <Text style={headerStyles.wordmark}>Kasane</Text>
        <Text style={headerStyles.subheading}>
          anime <Text style={headerStyles.subAccent}>+</Text> manga
        </Text>
        <View style={headerStyles.rule} />
      </Pressable>
      <View style={headerStyles.spacer} />
      <Pressable
        onPress={toggleJapanese}
        style={({ hovered, pressed }: any) => [
          headerStyles.langToggle,
          { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
        ]}
      >
        <Text style={headerStyles.langToggleText}>
          {japanese ? "JP" : "EN"}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/login")}
        style={({ hovered, pressed }: PressableState) => [
          headerStyles.accountPill,
          { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
        ]}
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
        maxAge: CATALOG_CACHE_MAX_AGE,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) &&
            query.queryKey[0] === CATALOG_QUERY_KEY[0],
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
              contentStyle: { backgroundColor: "#0c0c0e" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="anime/[id]/index" />
            <Stack.Screen name="anime/[id]/arc/[arcIdx]" />
            <Stack.Screen name="manga/[id]/index" />
            <Stack.Screen name="manga/[id]/arc/[arcIdx]" />
            <Stack.Screen name="series/[id]/index" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

const headerStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0c0e" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: "#7c5cff",
    fontSize: 32,
    fontFamily: FONT.bold,
    lineHeight: 32,
  },
  wordmarkPressable: {
    gap: 4,
  },
  wordmark: {
    color: "#f5f5f5",
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    fontFamily: FONT.display,
    paddingBottom: 2,
  },
  subheading: {
    color: "#cfd2d6",
    fontSize: 13,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
    paddingBottom: 6,
  },
  subAccent: {
    color: "#7c5cff",
    fontFamily: FONT.bold,
  },
  rule: {
    height: 4,
    width: 64,
    backgroundColor: "#7c5cff",
  },
  spacer: { flex: 1 },
  langToggle: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#7c5cff",
    alignSelf: "flex-start",
  },
  langToggleText: {
    color: "#0c0c0e",
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: FONT.bold,
  },
  accountPill: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#17181b",
    borderLeftWidth: 2,
    borderLeftColor: "#7c5cff",
    alignSelf: "flex-start",
  },
  accountPillText: {
    color: "#7c5cff",
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
});
