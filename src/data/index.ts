import type { SeriesMapping } from '../types';
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
