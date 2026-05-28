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
import { type Language, usePreferences } from '@/state/preferences';
import { FONT } from '@/theme';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'EN', label: 'EN' },
  { value: 'NATIVE', label: 'JP' },
];

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
  const language = usePreferences((s) => s.language);
  const setLanguage = usePreferences((s) => s.setLanguage);

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
        <Text style={headerStyles.wordmark}>Kasane</Text>
        <Text style={headerStyles.subheading}>
          anime <Text style={headerStyles.subAccent}>+</Text> manga
        </Text>
        <View style={headerStyles.rule} />
      </Pressable>
      <View style={headerStyles.spacer} />
      <View style={headerStyles.langGroup}>
        {LANGUAGES.map((l) => {
          const active = l.value === language;
          return (
            <Pressable
              key={l.value}
              onPress={() => setLanguage(l.value)}
              style={({ hovered, pressed }: any) => [
                headerStyles.langChip,
                active && headerStyles.langChipActive,
                { opacity: pressed ? 0.7 : hovered && !active ? 0.85 : 1 },
              ]}
            >
              <Text
                style={[
                  headerStyles.langChipText,
                  active && headerStyles.langChipTextActive,
                ]}
              >
                {l.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
            <Stack.Screen name="anime/[id]/index" />
            <Stack.Screen name="anime/[id]/arc/[arcIdx]" />
            <Stack.Screen name="manga/[id]/index" />
            <Stack.Screen name="manga/[id]/arc/[arcIdx]" />
            <Stack.Screen name="series/[id]/index" />
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
    gap: 4,
  },
  wordmark: {
    color: '#f5f5f5',
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    fontFamily: FONT.display,
  },
  subheading: {
    color: '#cfd2d6',
    fontSize: 13,
    letterSpacing: 6,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
    marginTop: 2,
  },
  subAccent: {
    color: '#7c5cff',
    fontFamily: FONT.bold,
  },
  rule: {
    height: 4,
    width: 64,
    backgroundColor: '#7c5cff',
    marginTop: 6,
  },
  spacer: { flex: 1 },
  langGroup: {
    flexDirection: 'row',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#17181b',
    minWidth: 36,
    alignItems: 'center',
  },
  langChipActive: {
    backgroundColor: '#7c5cff',
  },
  langChipText: {
    color: '#9aa0a6',
    fontSize: 12,
    letterSpacing: 1.2,
    fontFamily: FONT.bold,
  },
  langChipTextActive: {
    color: '#0c0c0e',
  },
});
