import type { AniListMedia, SeriesMapping } from '@/types';
import onePiece from '@/data/mappings/one-piece.json';
import attackOnTitan from '@/data/mappings/attack-on-titan.json';
import demonSlayer from '@/data/mappings/demon-slayer.json';
import onePunchMan from '@/data/mappings/one-punch-man.json';
import vinlandSaga from '@/data/mappings/vinland-saga.json';
import fullmetalAlchemistBrotherhood from '@/data/mappings/fullmetal-alchemist-brotherhood.json';
import hunterXHunter2011 from '@/data/mappings/hunter-x-hunter-2011.json';
import monster from '@/data/mappings/monster.json';
import jujutsuKaisen from '@/data/mappings/jujutsu-kaisen.json';
import bleachTybw from '@/data/mappings/bleach-tybw.json';
import mobPsycho100 from '@/data/mappings/mob-psycho-100.json';
import frieren from '@/data/mappings/frieren.json';
import apothecaryDiaries from '@/data/mappings/apothecary-diaries.json';
import nana from '@/data/mappings/nana.json';
import haikyuu from '@/data/mappings/haikyuu.json';
import fruitsBasket2019 from '@/data/mappings/fruits-basket-2019.json';
import berserk from '@/data/mappings/berserk.json';
import dragonBall from '@/data/mappings/dragon-ball.json';

const ALL_MAPPINGS: SeriesMapping[] = [
  onePiece as SeriesMapping,
  attackOnTitan as SeriesMapping,
  demonSlayer as SeriesMapping,
  onePunchMan as SeriesMapping,
  vinlandSaga as SeriesMapping,
  fullmetalAlchemistBrotherhood as SeriesMapping,
  hunterXHunter2011 as SeriesMapping,
  monster as SeriesMapping,
  jujutsuKaisen as SeriesMapping,
  bleachTybw as SeriesMapping,
  mobPsycho100 as SeriesMapping,
  frieren as SeriesMapping,
  apothecaryDiaries as SeriesMapping,
  nana as SeriesMapping,
  haikyuu as SeriesMapping,
  fruitsBasket2019 as SeriesMapping,
  berserk as SeriesMapping,
  dragonBall as SeriesMapping,
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
