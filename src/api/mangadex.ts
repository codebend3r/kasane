import { isRecord } from "@/data/guards";
import { MANGADEX_ROUTES, MANGADEX_USER_AGENT } from "@/data/mangadexRoutes";
import type { MangaDexSnapshot } from "@/data/mangadexSnapshot";
import type { MangaDexTitle } from "@/types";

/** Where requests go and what they carry. */
export type MangaDexClient = {
  api: string;
  covers: string;
  headers: Record<string, string>;
};

/**
 * The web build's client. `api.mangadex.org` and the covers CDN both answer a
 * browser User-Agent with a bot challenge, and the API only allows
 * cross-origin reads from localhost, so a browser reaches MangaDex through the
 * same-origin proxy paths. It cannot set `User-Agent`, so it sends none.
 */
export const webMangaDexClient: MangaDexClient = {
  api: MANGADEX_ROUTES.api.proxy,
  covers: MANGADEX_ROUTES.covers.proxy,
  headers: {},
};

/** Native apps are not challenged and call MangaDex directly. */
export const nativeMangaDexClient: MangaDexClient = {
  api: MANGADEX_ROUTES.api.upstream,
  covers: MANGADEX_ROUTES.covers.upstream,
  headers: {},
};

/** A script calls MangaDex directly with the non-browser User-Agent it accepts. */
export const scriptMangaDexClient: MangaDexClient = {
  ...nativeMangaDexClient,
  headers: { "User-Agent": MANGADEX_USER_AGENT },
};

/** The client the app itself reads MangaDex through. */
export const appMangaDexClient =
  typeof window !== "undefined" && !!window.location
    ? webMangaDexClient
    : nativeMangaDexClient;

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

async function fetchJson({
  client,
  url,
}: {
  client: MangaDexClient;
  url: string;
}): Promise<unknown> {
  const res = await fetch(url, { headers: client.headers });
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

const SAFE_RATINGS = "contentRating%5B%5D=safe&contentRating%5B%5D=suggestive";

async function searchByTitle({
  client,
  title,
}: {
  client: MangaDexClient;
  title: string;
}): Promise<MangaDexRecord[]> {
  const url = `${client.api}/manga?title=${encodeURIComponent(title)}&limit=10&${SAFE_RATINGS}`;
  return listOf(await fetchJson({ client, url }), isMangaRecord, url);
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

async function fetchCovers({
  client,
  mangaId,
  offset = 0,
  acc = [],
}: {
  client: MangaDexClient;
  mangaId: string;
  offset?: number;
  acc?: CoverRecord[];
}): Promise<CoverRecord[]> {
  const url = `${client.api}/cover?manga%5B%5D=${mangaId}&limit=${COVER_PAGE_SIZE}&offset=${offset}&order%5Bvolume%5D=asc`;
  const body = await fetchJson({ client, url });
  const page = listOf(body, isCoverRecord, url);
  const total =
    isRecord(body) && typeof body.total === "number" ? body.total : 0;
  const next = [...acc, ...page];
  const newOffset = offset + page.length;
  const done =
    page.length < COVER_PAGE_SIZE ||
    newOffset >= total ||
    newOffset >= COVER_PAGE_SIZE * COVER_MAX_PAGES;
  return done
    ? next
    : fetchCovers({ client, mangaId, offset: newOffset, acc: next });
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

async function fetchAggregate({
  client,
  mangaId,
}: {
  client: MangaDexClient;
  mangaId: string;
}): Promise<{ volumeCount: number; chapterCount: number }> {
  return countAggregate(
    await fetchJson({
      client,
      url: `${client.api}/manga/${mangaId}/aggregate`,
    }),
  );
}

/**
 * The MangaDex entry for an AniList manga, found by title and confirmed by
 * AniList link or exact title: its id, titles, hosted counts and the file name
 * of every volume cover. Null when nothing on MangaDex matches.
 */
export async function getMangaDexSnapshot({
  client,
  anilistId,
  title,
}: {
  client: MangaDexClient;
  anilistId: number;
  title: string;
}): Promise<MangaDexSnapshot | null> {
  const candidates = await searchByTitle({ client, title });
  const match = pickBestMatch(candidates, anilistId, title);
  if (!match) return null;

  const [covers, aggregate] = await Promise.all([
    fetchCovers({ client, mangaId: match.id }),
    fetchAggregate({ client, mangaId: match.id }),
  ]);

  return {
    mangadexId: match.id,
    titles: buildTitles(match),
    volumes: aggregate.volumeCount,
    chapters: aggregate.chapterCount,
    covers: covers.filter(hasVolume).map((c) => ({
      volume: c.attributes.volume,
      locale: c.attributes.locale ?? "ja",
      fileName: c.attributes.fileName,
    })),
  };
}
