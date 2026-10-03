import { StyleSheet, Text, View } from "react-native";
import type { MovieEntry } from "@/types";
import { COLOR, FONT, MOVIE_COLOR, SPACE, TEXT } from "@/theme";

export function SeriesMovies({ movies }: { movies: MovieEntry[] }) {
  const ordered = [...movies].sort(
    (a, b) =>
      (a.afterEpisode ?? Number.MAX_SAFE_INTEGER) -
        (b.afterEpisode ?? Number.MAX_SAFE_INTEGER) || a.year - b.year,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Movies</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACE.lg },
  sectionTitle: { ...TEXT.sectionTitle, color: COLOR.textPrimary },
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
