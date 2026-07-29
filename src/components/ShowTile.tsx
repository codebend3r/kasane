import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { useRouter } from "expo-router";
import type { MappedShow } from "@/data/mappedShows";
import type { Cover } from "@/data/covers";
import type { PressableState } from "@/types";
import { FONT } from "@/theme";

/** `12 eps · 42 ch`, or just the chapters when nothing is adapted yet. */
export const showMeta = (show: MappedShow): string =>
  `${show.episodes > 0 ? `${show.episodes} eps` : "Manga only"} · ${show.chapters} ch`;

/** Catalog tile used by the mapped-shows and my-shows screens. */
export function ShowTile({
  show,
  cover,
  trailing,
}: {
  show: MappedShow;
  cover?: Cover;
  trailing?: string;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/series/${show.routeId}`)}
      style={({ hovered, pressed }: PressableState) => [
        styles.tile,
        { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
      ]}
    >
      <Poster cover={cover} style={styles.poster} />
      <View style={styles.body}>
        <Text style={styles.tileTitle} numberOfLines={2}>
          {show.title}
        </Text>
        <Text style={styles.tileMeta}>{showMeta(show)}</Text>
        {!!trailing && <Text style={styles.tileTrailing}>{trailing}</Text>}
      </View>
    </Pressable>
  );
}

/**
 * Cover art with the series' own dominant colour behind it, so the layout
 * holds its shape and stays on-brand while AniList is still loading.
 */
export function Poster({
  cover,
  style,
}: {
  cover?: Cover;
  style: StyleProp<ImageStyle>;
}) {
  return cover ? (
    <Image
      source={{ uri: cover.url }}
      style={[style, { backgroundColor: cover.color ?? "#1f2024" }]}
      accessibilityIgnoresInvertColors
    />
  ) : (
    <View style={[style, styles.posterEmpty]} />
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    // Poster-shaped rather than the old text-only block, so a row of tiles
    // reads as cover art first: two up on a phone, more as the page widens.
    flexBasis: 140,
    maxWidth: 200,
    backgroundColor: "#17181b",
    borderLeftWidth: 3,
    borderLeftColor: "#7c5cff",
  },
  poster: { width: "100%", aspectRatio: 2 / 3 },
  posterEmpty: { backgroundColor: "#1f2024" },
  body: { gap: 4, padding: 10 },
  tileTitle: { color: "#f5f5f5", fontSize: 13, fontFamily: FONT.semibold },
  tileMeta: { color: "#6b7177", fontSize: 11, fontFamily: FONT.medium },
  tileTrailing: { color: "#5cff9d", fontSize: 11, fontFamily: FONT.bold },
});
