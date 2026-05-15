import type { MangaDexInfo, MangaDexVolumeCover, MangaDexTitle } from '../types';

const BASE = 'https://api.mangadex.org';
const UPLOADS = 'https://uploads.mangadex.org';

interface MangaDexRecord {
  id: string;
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    links: Record<string, string> | null;
    lastVolume: string | null;
    lastChapter: string | null;
  };
}

interface CoverRecord {
  id: string;
  attributes: {
    volume: string | null;
    locale: string | null;
    fileName: string;
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MangaDex ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

function buildTitles(record: MangaDexRecord): MangaDexTitle[] {
  const seen = new Set<string>();
  const out: MangaDexTitle[] = [];
  const push = (locale: string, value: string) => {
    const key = `${locale}::${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ locale, value });
  };
  for (const [locale, value] of Object.entries(record.attributes.title)) {
    push(locale, value);
  }
  for (const alt of record.attributes.altTitles) {
    for (const [locale, value] of Object.entries(alt)) {
      push(locale, value);
    }
  }
  return out;
}

function coverUrl(mangaId: string, fileName: string, size: '256' | '512' | 'full'): string {
  if (size === 'full') return `${UPLOADS}/covers/${mangaId}/${fileName}`;
  return `${UPLOADS}/covers/${mangaId}/${fileName}.${size}.jpg`;
}

async function searchByTitle(title: string): Promise<MangaDexRecord[]> {
  const url = `${BASE}/manga?title=${encodeURIComponent(title)}&limit=10`;
  const data = await fetchJson<{ data: MangaDexRecord[] }>(url);
  return data.data;
}

async function fetchCovers(mangaId: string): Promise<CoverRecord[]> {
  const out: CoverRecord[] = [];
  let offset = 0;
  for (let page = 0; page < 5; page++) {
    const url = `${BASE}/cover?manga%5B%5D=${mangaId}&limit=100&offset=${offset}&order%5Bvolume%5D=asc`;
    const data = await fetchJson<{ data: CoverRecord[]; total: number }>(url);
    out.push(...data.data);
    offset += data.data.length;
    if (data.data.length < 100 || offset >= data.total) break;
  }
  return out;
}

async function fetchAggregate(mangaId: string): Promise<{ volumeCount: number; chapterCount: number }> {
  const url = `${BASE}/manga/${mangaId}/aggregate`;
  const data = await fetchJson<{
    volumes: Record<string, { volume: string; chapters: Record<string, { chapter: string }> }>;
  }>(url);
  const volumes = data.volumes ?? {};
  let chapterCount = 0;
  for (const key of Object.keys(volumes)) {
    chapterCount += Object.keys(volumes[key].chapters ?? {}).length;
  }
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
    const al = c.attributes.links?.al;
    return al && Number(al) === anilistId;
  });
  if (!match) return null;

  const [covers, aggregate] = await Promise.all([
    fetchCovers(match.id),
    fetchAggregate(match.id),
  ]);

  const coverList: MangaDexVolumeCover[] = covers
    .filter((c) => c.attributes.volume)
    .map((c) => ({
      volume: c.attributes.volume as string,
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
