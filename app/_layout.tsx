import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
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
import { startCloudSync } from "@/state/sync";
import { startLoginPrompt } from "@/state/loginPrompt";
import { LoginPrompt } from "@/components/LoginPrompt";
import { GlobalHeader } from "@/components/GlobalHeader";
import { SideMenu } from "@/components/SideMenu";
import { COLOR } from "@/theme";

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
        <View style={styles.root}>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.background },
});
