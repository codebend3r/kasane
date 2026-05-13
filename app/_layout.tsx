import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { ZenTokyoZoo_400Regular } from '@expo-google-fonts/zen-tokyo-zoo';
import { FONT } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

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
        onPress={() => router.replace('/')}
        hitSlop={8}
        style={({ hovered, pressed }: any) => [
          headerStyles.wordmarkPressable,
          { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
        ]}
      >
        <Text style={headerStyles.wordmark}>
          Kasane<Text style={headerStyles.accent}>.app</Text>
        </Text>
        <View style={headerStyles.rule} />
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
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={headerStyles.root}>
          <GlobalHeader />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0c0c0e' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="series/[id]/index" />
            <Stack.Screen name="series/[id]/arc/[arcIdx]" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const headerStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0c0e' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#7c5cff',
    fontSize: 32,
    fontFamily: FONT.bold,
    lineHeight: 32,
  },
  wordmarkPressable: {
    gap: 6,
  },
  wordmark: {
    color: '#f5f5f5',
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    fontFamily: FONT.display,
  },
  accent: {
    color: '#7c5cff',
    fontFamily: FONT.display,
  },
  rule: {
    height: 4,
    width: 64,
    backgroundColor: '#7c5cff',
  },
});
