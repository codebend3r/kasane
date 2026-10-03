import type { MangaDexInfo, MangaDexVolumeCover, MangaDexTitle } from "@/types";

// api.mangadex.org only returns Access-Control-Allow-Origin for localhost, so
// on a deployed web origin we hit the Netlify proxy at /_mdx instead. Native
// builds and local dev call MangaDex directly.
function resolveBase(): string {
  if (typeof window === "undefined" || !window.location) {
    return "https://api.mangadex.org";
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "https://api.mangadex.org";
  }
  return "/_mdx";
}

const BASE = resolveBase();
const UPLOADS = "https://uploads.mangadex.org";

type MangaDexRecord = {
  id: string;
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    links: Record<string, string> | null;
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

// MangaDex responses arrive as `unknown` and are narrowed here, so a changed
// or partial payload is dropped rather than trusted.

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringRecord = (value: unknown): value is Record<string, string> =>
  isRecord(value) && Object.values(value).every((v) => typeof v === "string");

const isStringOrNull = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

export function isMangaRecord(value: unknown): value is MangaDexRecord {
  if (!isRecord(value) || typeof value.id !== "string") return false;
  const a = value.attributes;
  return (
    isRecord(a) &&
    isStringRecord(a.title) &&
    Array.isArray(a.altTitles) &&
    a.altTitles.every(isStringRecord) &&
    (a.links === null || isStringRecord(a.links))
  );
}

export function isCoverRecord(value: unknown): value is CoverRecord {
  if (!isRecord(value) || typeof value.id !== "string") return false;
  const a = value.attributes;
  return (
    isRecord(a) &&
    isStringOrNull(a.volume) &&
    isStringOrNull(a.locale) &&
    typeof a.fileName === "string"
  );
}

/** A cover tied to a volume number, the only kind the volume grid shows. */
export function hasVolume(
  cover: CoverRecord,
): cover is CoverRecord & { attributes: { volume: string } } {
  return !!cover.attributes.volume;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MangaDex ${res.status} for ${url}`);
  const body: unknown = await res.json();
  return body;
}

/** The well-formed items of a `{ data: [...] }` list response. */
function listOf<T>(
  body: unknown,
  isItem: (item: unknown) => item is T,
  url: string,
): T[] {
  if (!isRecord(body) || !Array.isArray(body.data)) {
    throw new Error(`MangaDex returned an unexpected shape for ${url}`);
  }
  return body.data.filter(isItem);
}

const TITLE_LOCALE_ORDER = ["en", "ja-ro", "ja"];

/** English, then romaji, then Japanese, then whichever title comes first. */
export function preferredTitle(
  titles: readonly MangaDexTitle[],
): string | null {
  const byLocale = TITLE_LOCALE_ORDER.flatMap(
    (locale) => titles.find((t) => t.locale === locale)?.value ?? [],
  );
  return byLocale[0] ?? titles[0]?.value ?? null;
}

const toTitles = (map: Record<string, string>): MangaDexTitle[] =>
  Object.entries(map).map(([locale, value]) => ({ locale, value }));

/** Main and alternative titles, de-duplicated, main titles first. */
function buildTitles(record: MangaDexRecord): MangaDexTitle[] {
  const all = [
    ...toTitles(record.attributes.title),
    ...record.attributes.altTitles.flatMap(toTitles),
  ];
  return [...new Map(all.map((t) => [`${t.locale}::${t.value}`, t])).values()];
}

function coverUrl(
  mangaId: string,
  fileName: string,
  size: "256" | "512" | "full",
): string {
  if (size === "full") return `${UPLOADS}/covers/${mangaId}/${fileName}`;
  return `${UPLOADS}/covers/${mangaId}/${fileName}.${size}.jpg`;
}

const SAFE_RATINGS = "contentRating%5B%5D=safe&contentRating%5B%5D=suggestive";

async function searchByTitle(title: string): Promise<MangaDexRecord[]> {
  const url = `${BASE}/manga?title=${encodeURIComponent(title)}&limit=10&${SAFE_RATINGS}`;
  return listOf(await fetchJson(url), isMangaRecord, url);
}

// Re-prints and color editions on MangaDex often own the AniList link even when
// the main series doesn't. Detect them in the primary title so the matcher can
// fall through to the main entry when the user's preferred title is plain.
const EDITION_MARKER_REGEX =
  /\b(?:official\s+)?(?:colou?red|deluxe|anniversary|box[\s-]*set|reprint|complete\s+edition|kanzenban|aizoban|bunkoban|full[\s-]?colou?r|colou?r|special\s+edition|hardcover|remaster(?:ed)?)\b/i;

const recordTitle = (record: MangaDexRecord): string =>
  preferredTitle(toTitles(record.attributes.title)) ?? "";

function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‐-―]/g, "-")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pickBestMatch(
  candidates: MangaDexRecord[],
  anilistId: number,
  preferredTitle: string,
): MangaDexRecord | null {
  const target = normalizeTitle(preferredTitle);
  const preferredHasMarker = EDITION_MARKER_REGEX.test(preferredTitle);
  const scored = candidates.map((c) => {
    const title = recordTitle(c);
    return {
      record: c,
      alMatch:
        !!c.attributes.links?.al && Number(c.attributes.links.al) === anilistId,
      titleExact: normalizeTitle(title) === target,
      penalized: !preferredHasMarker && EDITION_MARKER_REGEX.test(title),
    };
  });
  return (
    scored.find((s) => s.alMatch && !s.penalized)?.record ??
    scored.find((s) => s.titleExact && !s.penalized)?.record ??
    scored.find((s) => s.alMatch)?.record ??
    scored.find((s) => s.titleExact)?.record ??
    null
  );
}

const COVER_PAGE_SIZE = 100;
const COVER_MAX_PAGES = 5;

async function fetchCoverPage(
  mangaId: string,
  offset: number,
  acc: CoverRecord[],
): Promise<CoverRecord[]> {
  const url = `${BASE}/cover?manga%5B%5D=${mangaId}&limit=${COVER_PAGE_SIZE}&offset=${offset}&order%5Bvolume%5D=asc`;
  const body = await fetchJson(url);
  const page = listOf(body, isCoverRecord, url);
  const total =
    isRecord(body) && typeof body.total === "number" ? body.total : 0;
  const next = [...acc, ...page];
  const newOffset = offset + page.length;
  const done =
    page.length < COVER_PAGE_SIZE ||
    newOffset >= total ||
    newOffset >= COVER_PAGE_SIZE * COVER_MAX_PAGES;
  return done ? next : fetchCoverPage(mangaId, newOffset, next);
}

async function fetchCovers(mangaId: string): Promise<CoverRecord[]> {
  return fetchCoverPage(mangaId, 0, []);
}

// An empty aggregate comes back as `[]` rather than `{}`, so anything that is
// not an object counts as no entries.
const entriesOf = (value: unknown): [string, unknown][] =>
  isRecord(value) ? Object.entries(value) : [];

/** Volume and chapter counts from a `/manga/{id}/aggregate` response. */
export function countAggregate(body: unknown): {
  volumeCount: number;
  chapterCount: number;
} {
  const volumes = entriesOf(isRecord(body) ? body.volumes : null);
  return {
    volumeCount: volumes.filter(([k]) => k !== "none" && k !== "null").length,
    chapterCount: volumes.reduce(
      (sum, [, v]) => sum + entriesOf(isRecord(v) ? v.chapters : null).length,
      0,
    ),
  };
}

async function fetchAggregate(
  mangaId: string,
): Promise<{ volumeCount: number; chapterCount: number }> {
  return countAggregate(await fetchJson(`${BASE}/manga/${mangaId}/aggregate`));
}

export async function getMangaDexInfoByAniListId(
  anilistId: number,
  searchTitle: string,
): Promise<MangaDexInfo | null> {
  const candidates = await searchByTitle(searchTitle);
  const match = pickBestMatch(candidates, anilistId, searchTitle);
  if (!match) return null;

  const [covers, aggregate] = await Promise.all([
    fetchCovers(match.id),
    fetchAggregate(match.id),
  ]);

  const coverList: MangaDexVolumeCover[] = covers
    .filter(hasVolume)
    .map((c) => ({
      volume: c.attributes.volume,
      locale: c.attributes.locale ?? "ja",
      url: coverUrl(match.id, c.attributes.fileName, "512"),
      thumbUrl: coverUrl(match.id, c.attributes.fileName, "256"),
    }))
    .sort((a, b) => {
      const av = Number(a.volume);
      const bv = Number(b.volume);
      if (Number.isFinite(av) && Number.isFinite(bv)) return av - bv;
      return a.volume.localeCompare(b.volume);
    });

  const titles = buildTitles(match);

  return {
    id: match.id,
    primaryTitle: preferredTitle(titles) ?? searchTitle,
    titles,
    volumes: aggregate.volumeCount,
    chapters: aggregate.chapterCount,
    covers: coverList,
  };
}
