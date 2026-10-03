import { englishTitle } from "@/data/format";
import type {
  AniListMedia,
  RelationEdge,
  SeriesBadge,
  SeriesEntry,
  SeriesMapping,
} from "@/types";

// Pairing AniList media with their partner on the other side: an anime with
// its source manga, a manga with its adaptation.

export function findRelatedId(
  edges: RelationEdge[],
  relationType: "SOURCE" | "ADAPTATION",
  nodeType: "ANIME" | "MANGA",
): number | null {
  const hit = edges.find(
    (e) => e.relationType === relationType && e.node.type === nodeType,
  );
  return hit?.node.id ?? null;
}

/**
 * `media`'s partner on the other side, read from its own AniList relations: a
 * manga's anime adaptation, or an anime's source manga.
 */
export function partnerIdOf(media: AniListMedia): number | null {
  const edges = media.relations?.edges ?? [];
  return media.type === "MANGA"
    ? findRelatedId(edges, "ADAPTATION", "ANIME")
    : findRelatedId(edges, "SOURCE", "MANGA");
}

/** Which sides a series has, judged from one of its media. */
export function seriesBadgeOf(media: AniListMedia): SeriesBadge {
  if (partnerIdOf(media) !== null) return "both";
  return media.type === "MANGA" ? "manga-only" : "anime-only";
}

export const BADGE_LABEL: Record<SeriesBadge, string> = {
  both: "ANIME + MANGA",
  "manga-only": "MANGA ONLY",
  "anime-only": "ANIME ONLY",
};

/** For a badge laid over cover art, where "ONLY" does not fit. */
export const BADGE_SHORT_LABEL: Record<SeriesBadge, string> = {
  both: "ANIME + MANGA",
  "manga-only": "MANGA",
  "anime-only": "ANIME",
};

export function pairResults(media: AniListMedia[]): SeriesEntry[] {
  const byId = new Map<number, AniListMedia>(
    media.map((m): [number, AniListMedia] => [m.id, m]),
  );

  const absorbed = new Set(
    media
      .filter((m) => m.type === "ANIME")
      .map(partnerIdOf)
      .filter((id): id is number => id !== null && byId.has(id)),
  );

  const entries = media
    .filter((m) => !absorbed.has(m.id))
    .map((m): SeriesEntry => {
      const partnerId = partnerIdOf(m);
      if (m.type === "MANGA") {
        const anime = partnerId ? (byId.get(partnerId) ?? null) : null;
        return {
          routeId: m.id,
          primary: m,
          manga: m,
          anime,
          badge: seriesBadgeOf(m),
        };
      }
      const manga = partnerId ? (byId.get(partnerId) ?? null) : null;
      return {
        routeId: partnerId ?? m.id,
        primary: manga ?? m,
        manga,
        anime: m,
        badge: seriesBadgeOf(m),
      };
    });

  // Multiple anime adapting the same source manga (e.g. Mob Psycho 100 S1/II/III)
  // all collapse to the same routeId — keep the first (highest SEARCH_MATCH).
  return Array.from(
    entries
      .reduce((acc, e) => {
        if (!acc.has(e.routeId)) acc.set(e.routeId, e);
        return acc;
      }, new Map<number, SeriesEntry>())
      .values(),
  );
}

const PARTNER_RELATION_TYPES = new Set(["ADAPTATION", "SOURCE"]);

export function buildSyntheticMapping(
  media: AniListMedia,
): SeriesMapping | null {
  if (!media.relations) return null;

  const partnerType = media.type === "ANIME" ? "MANGA" : "ANIME";

  const candidates = media.relations.edges
    .filter((e) => PARTNER_RELATION_TYPES.has(e.relationType))
    .filter((e) => e.node.type === partnerType)
    .filter((e) =>
      partnerType === "ANIME" ? !!e.node.episodes : !!e.node.chapters,
    );

  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) =>
      (a.node.startDate?.year ?? 9999) - (b.node.startDate?.year ?? 9999),
  );
  const partner = candidates[0].node;

  const anime = media.type === "ANIME" ? media : partner;
  const manga = media.type === "MANGA" ? media : partner;

  const episodes = anime.episodes ?? null;
  const chapters = manga.chapters ?? null;
  if (!episodes || !chapters) return null;

  return {
    anilistAnimeId: anime.id,
    anilistMangaId: manga.id,
    title: englishTitle(media.title),
    sourceNotes:
      "Auto-estimated linear mapping — anime episode count distributed evenly across the manga chapter count. Real arc pacing is rarely uniform.",
    mappings: [
      {
        episodes: [1, episodes],
        chapters: [1, chapters],
        arc: "Full series (auto)",
      },
    ],
  };
}
