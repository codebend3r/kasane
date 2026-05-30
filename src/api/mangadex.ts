import type { MangaDexInfo, MangaDexVolumeCover, MangaDexTitle } from '@/types';

// api.mangadex.org only returns Access-Control-Allow-Origin for localhost, so
// on a deployed web origin we hit the Netlify proxy at /_mdx instead. Native
// builds and local dev call MangaDex directly.
function resolveBase(): string {
  if (typeof window === 'undefined' || !window.location) {
    return 'https://api.mangadex.org';
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'https://api.mangadex.org';
  }
  return '/_mdx';
}

const BASE = resolveBase();
const UPLOADS = 'https://uploads.mangadex.org';

type MangaDexRecord = {
  id: string;
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    links: Record<string, string> | null;
    lastVolume: string | null;
    lastChapter: string | null;
  };
};

type CoverRecord = {
  id: string;
  attributes: {
    volume: string | null;
    locale: string | null;
    fileName: string;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MangaDex ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

function buildTitles(record: MangaDexRecord): MangaDexTitle[] {
  const seen = new Set<string>();
  return [
    ...Object.entries(record.attributes.title),
    ...record.attributes.altTitles.flatMap((alt) => Object.entries(alt)),
  ].reduce<MangaDexTitle[]>((acc, [locale, value]) => {
    const key = `${locale}::${value}`;
    if (seen.has(key)) return acc;
    seen.add(key);
    acc.push({ locale, value });
    return acc;
  }, []);
}

function coverUrl(mangaId: string, fileName: string, size: '256' | '512' | 'full'): string {
  if (size === 'full') return `${UPLOADS}/covers/${mangaId}/${fileName}`;
  return `${UPLOADS}/covers/${mangaId}/${fileName}.${size}.jpg`;
}

const SAFE_RATINGS = 'contentRating%5B%5D=safe&contentRating%5B%5D=suggestive';

async function searchByTitle(title: string): Promise<MangaDexRecord[]> {
  const url = `${BASE}/manga?title=${encodeURIComponent(title)}&limit=10&${SAFE_RATINGS}`;
  const data = await fetchJson<{ data: MangaDexRecord[] }>(url);
  return data.data;
}

const COVER_PAGE_SIZE = 100;
const COVER_MAX_PAGES = 5;

async function fetchCoverPage(
  mangaId: string,
  offset: number,
  acc: CoverRecord[]
): Promise<CoverRecord[]> {
  const url = `${BASE}/cover?manga%5B%5D=${mangaId}&limit=${COVER_PAGE_SIZE}&offset=${offset}&order%5Bvolume%5D=asc`;
  const data = await fetchJson<{ data: CoverRecord[]; total: number }>(url);
  const next = [...acc, ...data.data];
  const newOffset = offset + data.data.length;
  const done =
    data.data.length < COVER_PAGE_SIZE ||
    newOffset >= data.total ||
    newOffset >= COVER_PAGE_SIZE * COVER_MAX_PAGES;
  return done ? next : fetchCoverPage(mangaId, newOffset, next);
}

async function fetchCovers(mangaId: string): Promise<CoverRecord[]> {
  return fetchCoverPage(mangaId, 0, []);
}

async function fetchAggregate(mangaId: string): Promise<{ volumeCount: number; chapterCount: number }> {
  const url = `${BASE}/manga/${mangaId}/aggregate`;
  const data = await fetchJson<{
    volumes: Record<string, { volume: string; chapters: Record<string, { chapter: string }> }>;
  }>(url);
  const volumes = data.volumes ?? {};
  const chapterCount = Object.values(volumes).reduce(
    (sum, v) => sum + Object.keys(v.chapters ?? {}).length,
    0
  );
  const numberedVolumes = Object.keys(volumes).filter(
    (k) => k !== 'none' && k !== 'null'
  );
  return { volumeCount: numberedVolumes.length, chapterCount };
}

export async function getMangaDexInfoByAniListId(
  anilistId: number,
  preferredTitle: string
): Promise<MangaDexInfo | null> {
  const candidates = await searchByTitle(preferredTitle);
  const match = candidates.find((c) => {
    const al = c.attributes.links?.al ?? null;
    return !!al && Number(al) === anilistId;
  });
  if (!match) return null;

  const [covers, aggregate] = await Promise.all([
    fetchCovers(match.id),
    fetchAggregate(match.id),
  ]);

  const hasVolume = (
    c: CoverRecord
  ): c is CoverRecord & { attributes: { volume: string } } =>
    !!c.attributes.volume;
  const coverList: MangaDexVolumeCover[] = covers
    .filter(hasVolume)
    .map((c) => ({
      volume: c.attributes.volume,
      locale: c.attributes.locale ?? 'ja',
      url: coverUrl(match.id, c.attributes.fileName, '512'),
      thumbUrl: coverUrl(match.id, c.attributes.fileName, '256'),
    }))
    .sort((a, b) => {
      const av = Number(a.volume);
      const bv = Number(b.volume);
      if (Number.isFinite(av) && Number.isFinite(bv)) return av - bv;
      return a.volume.localeCompare(b.volume);
    });

  const titles = buildTitles(match);
  const primaryTitle =
    titles.find((t) => t.locale === 'en')?.value ??
    titles.find((t) => t.locale === 'ja-ro')?.value ??
    titles[0]?.value ??
    preferredTitle;

  return {
    id: match.id,
    primaryTitle,
    titles,
    volumes: aggregate.volumeCount,
    chapters: aggregate.chapterCount,
    covers: coverList,
  };
}
