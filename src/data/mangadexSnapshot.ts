import { isRecord } from "@/data/guards";
import type { MangaDexInfo, MangaDexTitle, MangaDexVolumeCover } from "@/types";
import type { Database, Json } from "@/types/supabase";

export type MangaDexSeriesRow =
  Database["public"]["Tables"]["mangadex_series"]["Row"];

/** A volume cover as MangaDex names it, before any URL is built for it. */
export type MangaDexCoverFile = {
  volume: string;
  locale: string;
  fileName: string;
};

/**
 * Everything the app keeps from a MangaDex lookup, independent of where the
 * images are served from. Both the live lookup and the Supabase cache produce
 * one; `snapshotToInfo` turns it into what the screens render.
 */
export type MangaDexSnapshot = {
  mangadexId: string;
  titles: MangaDexTitle[];
  volumes: number;
  chapters: number;
  covers: MangaDexCoverFile[];
};

/** A `{ locale, value }` title as the `titles` column stores it. */
export function isMangaDexTitle(value: unknown): value is MangaDexTitle {
  return (
    isRecord(value) &&
    typeof value.locale === "string" &&
    typeof value.value === "string"
  );
}

/** A `{ volume, locale, fileName }` cover as the `covers` column stores it. */
export function isMangaDexCoverFile(
  value: unknown,
): value is MangaDexCoverFile {
  return (
    isRecord(value) &&
    typeof value.volume === "string" &&
    typeof value.locale === "string" &&
    typeof value.fileName === "string"
  );
}

/** The well-formed items of a jsonb list column; anything else is dropped. */
function listFromJson<T>(json: Json, isItem: (v: unknown) => v is T): T[] {
  const items: readonly unknown[] = Array.isArray(json) ? json : [];
  return items.filter(isItem);
}

/** A cover image under `base`: the original, or MangaDex's resized JPEG. */
export function coverUrl({
  base,
  mangaId,
  fileName,
  size,
}: {
  base: string;
  mangaId: string;
  fileName: string;
  size: "256" | "512" | "full";
}): string {
  const file = size === "full" ? fileName : `${fileName}.${size}.jpg`;
  return `${base}/${mangaId}/${file}`;
}

/** A cached row as a snapshot, so both sources render through one path. */
export function rowToSnapshot(row: MangaDexSeriesRow): MangaDexSnapshot {
  return {
    mangadexId: row.mangadex_id,
    titles: listFromJson(row.titles, isMangaDexTitle),
    volumes: row.volumes,
    chapters: row.chapters,
    covers: listFromJson(row.covers, isMangaDexCoverFile),
  };
}

/** The snapshot with every cover resolved to URLs under `coversBase`. */
export function snapshotToInfo({
  snapshot,
  coversBase,
}: {
  snapshot: MangaDexSnapshot;
  coversBase: string;
}): MangaDexInfo {
  const sized = (c: MangaDexCoverFile, size: "256" | "512"): string =>
    coverUrl({
      base: coversBase,
      mangaId: snapshot.mangadexId,
      fileName: c.fileName,
      size,
    });
  const covers: MangaDexVolumeCover[] = snapshot.covers.map((c) => ({
    volume: c.volume,
    locale: c.locale,
    url: sized(c, "512"),
    thumbUrl: sized(c, "256"),
  }));
  return {
    titles: snapshot.titles,
    volumes: snapshot.volumes,
    chapters: snapshot.chapters,
    covers,
  };
}
