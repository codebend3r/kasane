import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { MappedShow } from "@/data/mappedShows";
import type { CoverMap } from "@/data/covers";
import { GRID_GAP, GRID_PAGE_PADDING, gridLayout } from "@/data/gridLayout";
import { ShowTile } from "@/components/ShowTile";

export type ShowGridItem = { show: MappedShow; trailing?: string };

/**
 * Poster grid shared by the catalog and my-shows. Owns the column maths so
 * every row — including a short final one — uses the same tile width.
 */
export function ShowGrid({
  items,
  covers,
}: {
  items: readonly ShowGridItem[];
  covers: CoverMap;
}) {
  const { width } = useWindowDimensions();
  const { tileWidth } = gridLayout(width - GRID_PAGE_PADDING);

  return (
    <View style={styles.grid}>
      {items.map(({ show, trailing }) => (
        <ShowTile
          key={show.key}
          show={show}
          cover={covers[show.coverId]}
          trailing={trailing}
          width={tileWidth}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
});
