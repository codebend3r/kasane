import type {
  AniListMedia,
  MappingEntry,
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
import promisedNeverland from '@/data/mappings/promised-neverland.json';
import dandadan from '@/data/mappings/dandadan.json';
import tokyoRevengers from '@/data/mappings/tokyo-revengers.json';
import madeInAbyss from '@/data/mappings/made-in-abyss.json';
import naruto from '@/data/mappings/naruto.json';
import blackClover from '@/data/mappings/black-clover.json';
import fireForce from '@/data/mappings/fire-force.json';
import soulEater from '@/data/mappings/soul-eater.json';
import noragami from '@/data/mappings/noragami.json';
import mashle from '@/data/mappings/mashle.json';
import sakamotoDays from '@/data/mappings/sakamoto-days.json';
import kaijuNo8 from '@/data/mappings/kaiju-no-8.json';
import beastars from '@/data/mappings/beastars.json';
import goldenKamuy from '@/data/mappings/golden-kamuy.json';
import bleach from '@/data/mappings/bleach.json';
import yuYuHakusho from '@/data/mappings/yu-yu-hakusho.json';
import rurouniKenshin from '@/data/mappings/rurouni-kenshin.json';
import inuyasha from '@/data/mappings/inuyasha.json';
import fairyTail from '@/data/mappings/fairy-tail.json';
import sevenDeadlySins from '@/data/mappings/seven-deadly-sins.json';
import dgrayMan from '@/data/mappings/dgray-man.json';
import magi from '@/data/mappings/magi.json';
import akameGaKill from '@/data/mappings/akame-ga-kill.json';
import yonaOfTheDawn from '@/data/mappings/yona-of-the-dawn.json';
import jojoStardustCrusaders from '@/data/mappings/jojo-stardust-crusaders.json';
import tokyoGhoul from '@/data/mappings/tokyo-ghoul.json';
import bungoStrayDogs from '@/data/mappings/bungo-stray-dogs.json';
import hellsingUltimate from '@/data/mappings/hellsing-ultimate.json';
import blackButler from '@/data/mappings/black-butler.json';
import trigun from '@/data/mappings/trigun.json';
import parasyte from '@/data/mappings/parasyte.json';
import goblinSlayer from '@/data/mappings/goblin-slayer.json';
import deathNote from '@/data/mappings/death-note.json';
import codeGeass from '@/data/mappings/code-geass.json';
import steinsGate from '@/data/mappings/steins-gate.json';
import psychoPass from '@/data/mappings/psycho-pass.json';
import neonGenesisEvangelion from '@/data/mappings/neon-genesis-evangelion.json';

// JSON imports lose tuple types — `[1, 100]` becomes `number[]` instead of
// `[number, number]`. `normalizeMapping` rebuilds tuples literally.
type RawEntry = {
  episodes?: number[];
  chapters: number[];
  arc?: string;
  season?: number;
  note?: string;
};
type RawMapping = {
  anilistAnimeId: number;
  anilistMangaId: number;
  title: string;
  sourceNotes?: string;
  mappings: RawEntry[];
};

function normalizeEntry(e: RawEntry): MappingEntry {
  if (e.chapters.length !== 2) {
    throw new Error(`mapping entry chapters must be a 2-tuple: ${JSON.stringify(e)}`);
  }
  if (e.episodes && e.episodes.length !== 2) {
    throw new Error(`mapping entry episodes must be a 2-tuple: ${JSON.stringify(e)}`);
  }
  return {
    chapters: [e.chapters[0], e.chapters[1]],
    episodes: e.episodes ? [e.episodes[0], e.episodes[1]] : undefined,
    arc: e.arc,
    season: e.season,
    note: e.note,
  };
}

function normalizeMapping(m: RawMapping): SeriesMapping {
  return {
    anilistAnimeId: m.anilistAnimeId,
    anilistMangaId: m.anilistMangaId,
    title: m.title,
    sourceNotes: m.sourceNotes,
    mappings: m.mappings.map(normalizeEntry),
  };
}

const ALL_MAPPINGS: SeriesMapping[] = [
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
  promisedNeverland,
  dandadan,
  tokyoRevengers,
  madeInAbyss,
  naruto,
  blackClover,
  fireForce,
  soulEater,
  noragami,
  mashle,
  sakamotoDays,
  kaijuNo8,
  beastars,
  goldenKamuy,
  bleach,
  yuYuHakusho,
  rurouniKenshin,
  inuyasha,
  fairyTail,
  sevenDeadlySins,
  dgrayMan,
  magi,
  akameGaKill,
  yonaOfTheDawn,
  jojoStardustCrusaders,
  tokyoGhoul,
  bungoStrayDogs,
  hellsingUltimate,
  blackButler,
  trigun,
  parasyte,
  goblinSlayer,
  deathNote,
  codeGeass,
  steinsGate,
  psychoPass,
  neonGenesisEvangelion,
].map(normalizeMapping);

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
  edges: RelationEdge[],
  relationType: 'SOURCE' | 'ADAPTATION',
  nodeType: 'ANIME' | 'MANGA'
): number | null {
  const hit = edges.find(
    (e) => e.relationType === relationType && e.node.type === nodeType
  );
  return hit?.node.id ?? null;
}

export function pairResults(media: AniListMedia[]): SeriesEntry[] {
  const byId = new Map<number, AniListMedia>(
    media.map((m): [number, AniListMedia] => [m.id, m])
  );

  const absorbed = new Set(
    media
      .filter((m) => m.type === 'ANIME')
      .map((m) => findRelatedId(m.relations?.edges ?? [], 'SOURCE', 'MANGA'))
      .filter((id): id is number => id !== null && byId.has(id))
  );

  const entries = media
    .filter((m) => !absorbed.has(m.id))
    .map((m): SeriesEntry => {
      if (m.type === 'MANGA') {
        const adapterId = findRelatedId(m.relations?.edges ?? [], 'ADAPTATION', 'ANIME');
        const anime = adapterId ? byId.get(adapterId) ?? null : null;
        return {
          routeId: m.id,
          primary: m,
          manga: m,
          anime,
          badge: adapterId ? 'both' : 'manga-only',
        };
      }
      const sourceMangaId = findRelatedId(m.relations?.edges ?? [], 'SOURCE', 'MANGA');
      const manga = sourceMangaId ? byId.get(sourceMangaId) ?? null : null;
      return {
        routeId: sourceMangaId ?? m.id,
        primary: manga ?? m,
        manga,
        anime: m,
        badge: sourceMangaId ? 'both' : 'anime-only',
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
      .values()
  );
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
