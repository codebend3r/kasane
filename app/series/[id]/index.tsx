import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMedia } from '../../../src/api/anilist';
import { FONT } from '../../../src/theme';

// Legacy /series/[id] entry — fetches the media type once and redirects to
// /manga/[id] or /anime/[id]. Keeps old bookmarks working.
export default function SeriesRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);
  const router = useRouter();

  const { data: media, error } = useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !Number.isNaN(mediaId),
  });

  useEffect(() => {
    if (!media) return;
    const pathname = media.type === 'MANGA' ? '/manga/[id]' : '/anime/[id]';
    router.replace({ pathname, params: { id: String(media.id) } });
  }, [media, router]);

  return (
    <View style={styles.center}>
      {error ? (
        <Text style={styles.empty}>Could not load series.</Text>
      ) : (
        <ActivityIndicator color="#7c5cff" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#9aa0a6', fontFamily: FONT.regular },
});
