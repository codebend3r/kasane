import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import type { MappedShow } from "@/data/mappedShows";
import type { PressableState } from "@/types";
import { FONT } from "@/theme";

/** Catalog tile used by the mapped-shows and my-shows screens. */
export function ShowTile({
  show,
  trailing,
}: {
  show: MappedShow;
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
      <Text style={styles.tileTitle} numberOfLines={2}>
        {show.title}
      </Text>
      <Text style={styles.tileMeta}>
        {show.episodes > 0 ? `${show.episodes} eps` : "Manga only"}
        {" · "}
        {show.chapters} ch
      </Text>
      {!!trailing && <Text style={styles.tileTrailing}>{trailing}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: 200,
    maxWidth: 320,
    gap: 4,
    padding: 12,
    backgroundColor: "#17181b",
    borderLeftWidth: 3,
    borderLeftColor: "#7c5cff",
  },
  tileTitle: { color: "#f5f5f5", fontSize: 14, fontFamily: FONT.semibold },
  tileMeta: { color: "#6b7177", fontSize: 12, fontFamily: FONT.medium },
  tileTrailing: { color: "#5cff9d", fontSize: 12, fontFamily: FONT.bold },
});
