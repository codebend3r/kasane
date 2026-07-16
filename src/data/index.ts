import type {
  AniListMedia,
  RelationEdge,
  SeriesEntry,
  SeriesMapping,
} from "@/types";

// Pure mapping helpers. The curated mappings themselves now live in Supabase
// and are fetched via `@/data/catalog`; these functions operate on whatever
// `SeriesMapping` they are handed (curated or synthetic).

export function episodeToChapters(
  mapping: SeriesMapping,
  episode: number,
): [number, number] | null {
  const hit = mapping.mappings.find(
    (m) => !!m.episodes && episode >= m.episodes[0] && episode <= m.episodes[1],
  );
  return hit ? hit.chapters : null;
}

export function chapterToEpisodes(
  mapping: SeriesMapping,
  chapter: number,
): [number, number] | null {
  const hit = mapping.mappings.find(
    (m) => chapter >= m.chapters[0] && chapter <= m.chapters[1],
  );
  return hit?.episodes ?? null;
}

function findRelatedId(
  edges: RelationEdge[],
  relationType: "SOURCE" | "ADAPTATION",
  nodeType: "ANIME" | "MANGA",
): number | null {
  const hit = edges.find(
    (e) => e.relationType === relationType && e.node.type === nodeType,
  );
  return hit?.node.id ?? null;
}

export function pairResults(media: AniListMedia[]): SeriesEntry[] {
  const byId = new Map<number, AniListMedia>(
    media.map((m): [number, AniListMedia] => [m.id, m]),
  );

  const absorbed = new Set(
    media
      .filter((m) => m.type === "ANIME")
      .map((m) => findRelatedId(m.relations?.edges ?? [], "SOURCE", "MANGA"))
      .filter((id): id is number => id !== null && byId.has(id)),
  );

  const entries = media
    .filter((m) => !absorbed.has(m.id))
    .map((m): SeriesEntry => {
      if (m.type === "MANGA") {
        const adapterId = findRelatedId(
          m.relations?.edges ?? [],
          "ADAPTATION",
          "ANIME",
        );
        const anime = adapterId ? (byId.get(adapterId) ?? null) : null;
        return {
          routeId: m.id,
          primary: m,
          manga: m,
          anime,
          badge: adapterId ? "both" : "manga-only",
        };
      }
      const sourceMangaId = findRelatedId(
        m.relations?.edges ?? [],
        "SOURCE",
        "MANGA",
      );
      const manga = sourceMangaId ? (byId.get(sourceMangaId) ?? null) : null;
      return {
        routeId: sourceMangaId ?? m.id,
        primary: manga ?? m,
        manga,
        anime: m,
        badge: sourceMangaId ? "both" : "anime-only",
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
    title: media.title.english ?? media.title.romaji ?? "Series",
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
