import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useCatalog } from "@/queries/catalog";
import { toMappedShow } from "@/data/mappedShows";
import { useAuthEmail, useAuthStatus } from "@/state/auth";
import { useInProgressEntries } from "@/state/progress";
import { useCovers } from "@/queries/covers";
import { ShowGrid } from "@/components/ShowGrid";
import { Footer } from "@/components/Footer";
import { COLOR, FONT, pressFeedback, SPACE, TEXT } from "@/theme";

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
            accessibilityRole="link"
            accessibilityLabel="Sign in to save your shows"
            style={(state) => [styles.calloutButton, pressFeedback(state)]}
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
  content: { gap: SPACE.lg, padding: SPACE.xl, paddingBottom: SPACE.pageEnd },
  eyebrow: { ...TEXT.eyebrow, color: COLOR.accent },
  title: { ...TEXT.pageTitle, color: COLOR.textPrimary },
  blurb: { color: COLOR.textMuted, fontSize: 14, fontFamily: FONT.regular },
  callout: {
    maxWidth: 620,
    gap: SPACE.mdl,
    padding: SPACE.xl,
    backgroundColor: COLOR.surfaceCallout,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.danger,
  },
  calloutEyebrow: { ...TEXT.eyebrow, color: COLOR.danger },
  calloutTitle: {
    color: COLOR.textPrimary,
    fontSize: 16,
    fontFamily: FONT.bold,
  },
  calloutBody: {
    color: COLOR.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT.regular,
  },
  calloutButton: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACE.xl,
    paddingVertical: SPACE.mdl,
    backgroundColor: COLOR.danger,
  },
  calloutButtonText: { ...TEXT.buttonLabel, color: COLOR.background },
  synced: { color: COLOR.success, fontSize: 13, fontFamily: FONT.medium },
  muted: {
    color: COLOR.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.regular,
  },
});
