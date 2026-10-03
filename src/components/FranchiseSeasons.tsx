import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import type { AnimeFranchise, PressableState } from "@/types";
import { COLOR, FONT } from "@/theme";

/**
 * Every season and side story in an anime franchise, with the TV total across
 * them. Each card opens that entry's own series screen.
 */
export function FranchiseSeasons({
  franchise,
  currentId,
}: {
  franchise: AnimeFranchise;
  currentId: number;
}) {
  return (
    <View style={styles.seasons}>
      <Text style={styles.sectionTitle}>Seasons & entries</Text>
      {franchise.tvSeasonCount > 1 && (
        <Text style={styles.franchiseTotal}>
          Franchise total: {franchise.totalTvEpisodes} TV eps across{" "}
          {franchise.tvSeasonCount} seasons
        </Text>
      )}
      <View style={styles.seasonGrid}>
        {franchise.seasons.map((s) => {
          const isCurrent = s.id === currentId;
          return (
            <Link
              key={s.id}
              href={{ pathname: "/series/[id]", params: { id: s.id } }}
              asChild
            >
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${s.title}${isCurrent ? ", current season" : ""}`}
                style={({ hovered, pressed }: PressableState) => [
                  styles.seasonCard,
                  isCurrent && styles.seasonCardActive,
                  { opacity: pressed ? 0.6 : hovered ? 0.9 : 1 },
                ]}
              >
                <Text style={styles.seasonCardTitle} numberOfLines={2}>
                  {s.title}
                </Text>
                <Text style={styles.seasonCardMeta}>
                  {s.format ?? "—"}
                  {s.episodes ? ` · ${s.episodes} eps` : ""}
                  {s.year ? ` · ${s.year}` : ""}
                </Text>
                {isCurrent && (
                  <Text style={styles.seasonCardCurrent}>VIEWING</Text>
                )}
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seasons: { gap: 10 },
  sectionTitle: {
    color: COLOR.textPrimary,
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  franchiseTotal: {
    color: COLOR.accent,
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.semibold,
  },
  seasonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  seasonCard: {
    width: 220,
    padding: 12,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
    gap: 6,
  },
  seasonCardActive: {
    backgroundColor: COLOR.surfaceNotice,
    borderLeftColor: COLOR.notice,
  },
  seasonCardTitle: {
    color: COLOR.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: FONT.semibold,
    letterSpacing: -0.2,
  },
  seasonCardMeta: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
  seasonCardCurrent: {
    color: COLOR.notice,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
});
