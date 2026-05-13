import type { AniListMedia, SeriesMapping } from '../types';
import onePiece from './mappings/one-piece.json';
import attackOnTitan from './mappings/attack-on-titan.json';
import demonSlayer from './mappings/demon-slayer.json';

const ALL_MAPPINGS: SeriesMapping[] = [
  onePiece as SeriesMapping,
  attackOnTitan as SeriesMapping,
  demonSlayer as SeriesMapping,
];

export function findMappingByMediaId(mediaId: number): SeriesMapping | null {
  return (
    ALL_MAPPINGS.find(
      (m) => m.anilistAnimeId === mediaId || m.anilistMangaId === mediaId
    ) ?? null
  );
}

export function episodeToChapters(
  mapping: SeriesMapping,
  episode: number
): [number, number] | null {
  const hit = mapping.mappings.find(
    (m) => episode >= m.episodes[0] && episode <= m.episodes[1]
  );
  return hit ? hit.chapters : null;
}

export function chapterToEpisodes(
  mapping: SeriesMapping,
  chapter: number
): [number, number] | null {
  const hit = mapping.mappings.find(
    (m) => chapter >= m.chapters[0] && chapter <= m.chapters[1]
  );
  return hit ? hit.episodes : null;
}

export { ALL_MAPPINGS };

const PARTNER_RELATION_TYPES = new Set(['ADAPTATION', 'SOURCE']);

export function buildSyntheticMapping(media: AniListMedia): SeriesMapping | null {
  if (!media.relations) return null;

  const partnerType = media.type === 'ANIME' ? 'MANGA' : 'ANIME';

  const candidates = media.relations.edges
    .filter((e) => PARTNER_RELATION_TYPES.has(e.relationType))
    .filter((e) => e.node.type === partnerType)
    .filter((e) =>
      partnerType === 'ANIME' ? !!e.node.episodes : !!e.node.chapters
    );

  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) =>
      (a.node.startDate?.year ?? 9999) - (b.node.startDate?.year ?? 9999)
  );
  const partner = candidates[0].node;

  const anime = media.type === 'ANIME' ? media : partner;
  const manga = media.type === 'MANGA' ? media : partner;

  const episodes = anime.episodes ?? null;
  const chapters = manga.chapters ?? null;
  if (!episodes || !chapters) return null;

  return {
    anilistAnimeId: anime.id,
    anilistMangaId: manga.id,
    title: media.title.english ?? media.title.romaji ?? 'Series',
    sourceNotes: 'Auto-estimated linear mapping — anime episode count distributed evenly across the manga chapter count. Real arc pacing is rarely uniform; submit a curated JSON for accuracy.',
    mappings: [
      {
        episodes: [1, episodes],
        chapters: [1, chapters],
        arc: 'Full series (auto)',
      },
    ],
  };
}
