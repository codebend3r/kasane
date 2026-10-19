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
  const edges = media.relations.edges;
  return media.type === "MANGA"
    ? findRelatedId(edges, "ADAPTATION", "ANIME")
    : findRelatedId(edges, "SOURCE", "MANGA");
}

/**
 * The partner id to show `media` with: the one a curated mapping names when
 * there is one, otherwise the partner AniList's own relations point at.
 */
export function partnerIdFor({
  media,
  curated,
}: {
  media: AniListMedia;
  curated: SeriesMapping | null;
}): number | null {
  if (!curated) return partnerIdOf(media);
  return media.id === curated.anilistAnimeId
    ? curated.anilistMangaId
    : curated.anilistAnimeId;
}

/**
 * The series `media` belongs to, given its partner's id and, once loaded, the
 * partner itself. A series is keyed on its manga, so progress marked from
 * either side lands in one place, and a known partner id is enough to call it
 * "both" while the partner is still loading.
 */
export function toSeriesEntry<M extends AniListMedia>({
  media,
  partnerId,
  partner,
}: {
  media: M;
  partnerId: number | null;
  partner: M | null;
}): SeriesEntry<M> {
  const isManga = media.type === "MANGA";
  const other =
    partner !== null && partner.type !== media.type ? partner : null;
  const manga = isManga ? media : other;
  const badge: SeriesBadge =
    partnerId !== null ? "both" : isManga ? "manga-only" : "anime-only";
  return {
    routeId: isManga ? media.id : (partnerId ?? media.id),
    primary: manga ?? media,
    manga,
    anime: isManga ? other : media,
    badge,
  };
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
    .map((m) => {
      const partnerId = partnerIdOf(m);
      return toSeriesEntry({
        media: m,
        partnerId,
        partner: partnerId === null ? null : (byId.get(partnerId) ?? null),
      });
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
  const partnerType = media.type === "ANIME" ? "MANGA" : "ANIME";

  const candidates = media.relations.edges
    .filter((e) => PARTNER_RELATION_TYPES.has(e.relationType))
    .filter((e) => e.node.type === partnerType)
    .filter((e) =>
      partnerType === "ANIME" ? !!e.node.episodes : !!e.node.chapters,
    );

  // The earliest partner by start year; an undated one sorts last.
  const [earliest] = [...candidates].sort(
    (a, b) => (a.node.startDate.year ?? 9999) - (b.node.startDate.year ?? 9999),
  );
  if (!earliest) return null;
  const partner = earliest.node;

  const anime = media.type === "ANIME" ? media : partner;
  const manga = media.type === "MANGA" ? media : partner;

  const episodes = anime.episodes;
  const chapters = manga.chapters;
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
    movies: [],
  };
}
