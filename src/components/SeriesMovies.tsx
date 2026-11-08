import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MovieEntry } from "@/types";
import { COLOR, FONT, MOVIE_COLOR, pressFeedback, SPACE, TEXT } from "@/theme";

/**
 * A franchise's films, placed against the episodes they follow. Collapsed by
 * default: a long-running series can carry a dozen films, and the screen's
 * focus is the episode and chapter map above.
 */
export function SeriesMovies({ movies }: { movies: MovieEntry[] }) {
  const [open, setOpen] = useState(false);
  const ordered = useMemo(
    () =>
      [...movies].sort(
        (a, b) =>
          (a.afterEpisode ?? Number.MAX_SAFE_INTEGER) -
            (b.afterEpisode ?? Number.MAX_SAFE_INTEGER) || a.year - b.year,
      ),
    [movies],
  );
  const count = `${movies.length} ${movies.length === 1 ? "movie" : "movies"}`;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityLabel={`Movies, ${count}`}
        accessibilityHint={open ? "Collapses the list" : "Expands the list"}
        aria-expanded={open}
        style={(state) => [styles.header, pressFeedback(state)]}
      >
        <Text style={styles.sectionTitle}>Movies</Text>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.chevron}>{open ? "▴" : "▾"}</Text>
      </Pressable>

      {open && (
        <View style={styles.list}>
          {ordered.map((movie, idx) => (
            <View key={`${movie.title}-${idx}`} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.position}>
                  {typeof movie.afterEpisode === "number"
                    ? `◆ AFTER EP ${movie.afterEpisode}`
                    : "◆ MOVIE"}
                </Text>
                <Text style={styles.meta}>
                  {movie.year}
                  {movie.chapters
                    ? ` · ch ${movie.chapters[0]}–${movie.chapters[1]}`
                    : ""}
                </Text>
              </View>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              {!!movie.note && <Text style={styles.note}>{movie.note}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACE.lg },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    alignSelf: "flex-start",
    gap: SPACE.md,
    paddingVertical: SPACE.xs,
  },
  sectionTitle: { ...TEXT.sectionTitle, color: COLOR.textPrimary },
  count: { ...TEXT.chipLabel, color: COLOR.textMuted },
  chevron: {
    color: MOVIE_COLOR,
    fontSize: 14,
    fontFamily: FONT.bold,
  },
  list: { gap: SPACE.md },
  card: {
    padding: SPACE.lg,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 2,
    borderLeftColor: MOVIE_COLOR,
    gap: SPACE.xs,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: SPACE.lg,
    flexWrap: "wrap",
  },
  position: {
    color: MOVIE_COLOR,
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
  meta: {
    color: COLOR.textMuted,
    fontSize: 12,
    fontFamily: FONT.regular,
  },
  movieTitle: {
    color: COLOR.textPrimary,
    fontSize: 14,
    fontFamily: FONT.semibold,
  },
  note: {
    color: COLOR.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: FONT.regular,
  },
});
