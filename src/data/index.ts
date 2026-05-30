import type {
  AniListMedia,
  RelationEdge,
  SeriesEntry,
  SeriesMapping,
} from '@/types';
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
import dragonBallZ from '@/data/mappings/dragon-ball-z.json';
import dragonBallSuper from '@/data/mappings/dragon-ball-super.json';
import wistoriaWandAndSword from '@/data/mappings/wistoria-wand-and-sword.json';
import drStone from '@/data/mappings/dr-stone.json';
import baki from '@/data/mappings/baki.json';
import bakiHanma from '@/data/mappings/baki-hanma.json';
import assassinationClassroom from '@/data/mappings/assassination-classroom.json';
import gintama from '@/data/mappings/gintama.json';
import kaguyaSama from '@/data/mappings/kaguya-sama.json';
import marchComesInLikeALion from '@/data/mappings/3-gatsu-no-lion.json';
import kingdom from '@/data/mappings/kingdom.json';
import ashitaNoJoe from '@/data/mappings/ashita-no-joe.json';
import hajimeNoIppo from '@/data/mappings/hajime-no-ippo.json';
import ikokuNikki from '@/data/mappings/ikoku-nikki.json';
import witchHatAtelier from '@/data/mappings/witch-hat-atelier.json';
import bocchiTheRock from '@/data/mappings/bocchi-the-rock.json';
import orb from '@/data/mappings/orb.json';
import mushishi from '@/data/mappings/mushishi.json';
import myHeroAcademia from '@/data/mappings/my-hero-academia.json';
import oshiNoKo from '@/data/mappings/oshi-no-ko.json';
import chainsawMan from '@/data/mappings/chainsaw-man.json';
import spyXFamily from '@/data/mappings/spy-x-family.json';

const ALL_MAPPINGS = [
  onePiece,
  attackOnTitan,
  demonSlayer,
  onePunchMan,
  vinlandSaga,
  fullmetalAlchemistBrotherhood,
  hunterXHunter2011,
  monster,
  jujutsuKaisen,
  bleachTybw,
  mobPsycho100,
  frieren,
  apothecaryDiaries,
  nana,
  haikyuu,
  fruitsBasket2019,
  berserk,
  dragonBall,
  dragonBallZ,
  dragonBallSuper,
  wistoriaWandAndSword,
  drStone,
  baki,
  bakiHanma,
  assassinationClassroom,
  gintama,
  kaguyaSama,
  marchComesInLikeALion,
  kingdom,
  ashitaNoJoe,
  hajimeNoIppo,
  ikokuNikki,
  witchHatAtelier,
  bocchiTheRock,
  orb,
  mushishi,
  myHeroAcademia,
  oshiNoKo,
  chainsawMan,
  spyXFamily,
] as unknown as SeriesMapping[];

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
    (m) => !!m.episodes && episode >= m.episodes[0] && episode <= m.episodes[1]
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
  return hit?.episodes ?? null;
}

export { ALL_MAPPINGS };

function findRelatedId(
  edges: RelationEdge[] | undefined,
  relationType: 'SOURCE' | 'ADAPTATION',
  nodeType: 'ANIME' | 'MANGA'
): number | null {
  const hit = edges?.find(
    (e) => e.relationType === relationType && e.node.type === nodeType
  );
  return hit?.node.id ?? null;
}

export function pairResults(media: AniListMedia[]): SeriesEntry[] {
  const byId = new Map<number, AniListMedia>();
  for (const m of media) byId.set(m.id, m);

  const absorbed = new Set<number>();
  for (const m of media) {
    if (m.type !== 'ANIME') continue;
    const sourceMangaId = findRelatedId(m.relations?.edges, 'SOURCE', 'MANGA');
    if (sourceMangaId && byId.has(sourceMangaId)) {
      absorbed.add(m.id);
    }
  }

  const entries: SeriesEntry[] = [];
  for (const m of media) {
    if (absorbed.has(m.id)) continue;

    if (m.type === 'MANGA') {
      const adapterId = findRelatedId(m.relations?.edges, 'ADAPTATION', 'ANIME');
      const anime = adapterId ? byId.get(adapterId) ?? null : null;
      entries.push({
        routeId: m.id,
        primary: m,
        manga: m,
        anime,
        badge: adapterId ? 'both' : 'manga-only',
      });
    } else {
      const sourceMangaId = findRelatedId(m.relations?.edges, 'SOURCE', 'MANGA');
      const manga = sourceMangaId ? byId.get(sourceMangaId) ?? null : null;
      entries.push({
        routeId: sourceMangaId ?? m.id,
        primary: manga ?? m,
        manga,
        anime: m,
        badge: sourceMangaId ? 'both' : 'anime-only',
      });
    }
  }

  return entries;
}

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
