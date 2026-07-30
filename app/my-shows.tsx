import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useCatalog } from "@/data/catalog";
import { toMappedShow } from "@/data/mappedShows";
import { useAuthEmail, useAuthStatus } from "@/state/auth";
import { useInProgressEntries } from "@/state/progress";
import { useCovers } from "@/data/covers";
import { ShowGrid } from "@/components/ShowGrid";
import { Footer } from "@/components/Footer";
import type { PressableState } from "@/types";
import { FONT } from "@/theme";

export default function MyShowsScreen() {
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
  const covers = useCovers(
    useMemo(() => shows.map(({ show }) => show.coverId), [shows]),
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Tracking</Text>
      <Text style={styles.title}>My shows</Text>
      <Text style={styles.blurb}>
        Series you&rsquo;ve marked progress on, newest first.
      </Text>

      {status !== "signedIn" && (
        <View style={styles.callout}>
          <Text style={styles.calloutEyebrow}>Not signed in</Text>
          <Text style={styles.calloutTitle}>
            These shows live only on this device
          </Text>
          <Text style={styles.calloutBody}>
            Sign in to save what you&rsquo;re watching to your account. Without
            one this list disappears when you clear your browser data, and it
            won&rsquo;t follow you to another device.
          </Text>
          <Pressable
            onPress={() => router.push("/login")}
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
        <Text style={styles.synced}>Synced to {email}</Text>
      )}

      {shows.length === 0 ? (
        <Text style={styles.muted}>
          Nothing tracked yet. Tap an arc on any series to mark your progress
          and it will show up here.
        </Text>
      ) : (
        <ShowGrid items={shows} covers={covers} />
      )}
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 40 },
  eyebrow: {
    color: "#7c5cff",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 24,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  blurb: { color: "#9aa0a6", fontSize: 14, fontFamily: FONT.regular },
  callout: {
    maxWidth: 620,
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
  synced: { color: "#5cff9d", fontSize: 13, fontFamily: FONT.medium },
  muted: {
    color: "#6b7177",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.regular,
  },
});
