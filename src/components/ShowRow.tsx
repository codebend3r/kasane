import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import type { MappedShow } from "@/data/mappedShows";
import type { Cover } from "@/data/covers";
import { Poster, showMeta } from "@/components/ShowTile";
import { MOBILE_WIDTH_BREAKPOINT } from "@/components/CoverCarousel";
import type { PressableState } from "@/types";
import { COLOR, FONT } from "@/theme";

/**
 * List-view counterpart to `ShowTile`: poster in the leftmost column, then the
 * title and the two counts. Narrow screens have no room for count columns, so
 * they fold into a single meta line under the title.
 */
export function ShowRow({
  show,
  cover,
  trailing,
}: {
  show: MappedShow;
  cover?: Cover;
  trailing?: string;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < MOBILE_WIDTH_BREAKPOINT;

  return (
    <Pressable
      onPress={() => router.push(`/series/${show.routeId}`)}
      accessibilityRole="link"
      accessibilityLabel={`${show.title}. ${showMeta(show)}`}
      style={({ hovered, pressed }: PressableState) => [
        styles.row,
        { opacity: pressed ? 0.7 : hovered ? 0.9 : 1 },
      ]}
    >
      <Poster cover={cover} style={styles.poster} />
      <View style={styles.titleCell}>
        <Text style={styles.title} numberOfLines={2}>
          {show.title}
        </Text>
        {isNarrow && <Text style={styles.meta}>{showMeta(show)}</Text>}
        {!!trailing && <Text style={styles.trailing}>{trailing}</Text>}
      </View>
      {!isNarrow && (
        <>
          <Text style={styles.count}>
            {show.episodes > 0 ? `${show.episodes} eps` : "—"}
          </Text>
          <Text style={styles.count}>{show.chapters} ch</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
  },
  poster: { width: 40, height: 60 },
  // Rows span the page, but the title column stops growing so the counts stay
  // beside the titles on a wide monitor instead of a screen-width away.
  titleCell: { flex: 1, maxWidth: 620, gap: 2 },
  title: { color: COLOR.textPrimary, fontSize: 14, fontFamily: FONT.semibold },
  meta: { color: COLOR.textMuted, fontSize: 11, fontFamily: FONT.medium },
  trailing: { color: COLOR.success, fontSize: 11, fontFamily: FONT.bold },
  count: {
    width: 90,
    textAlign: "right",
    color: COLOR.textMuted,
    fontSize: 12,
    letterSpacing: 0.6,
    fontFamily: FONT.medium,
  },
});
