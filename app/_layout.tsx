import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#0c0c0e' },
            headerTitleStyle: { color: '#f5f5f5' },
            headerTintColor: '#7c5cff',
            contentStyle: { backgroundColor: '#0c0c0e' },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'anime-manga-guide' }} />
          <Stack.Screen name="series/[id]" options={{ title: 'Series' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
