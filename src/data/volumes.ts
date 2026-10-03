import type { MangaDexVolumeCover } from "@/types";

/** One volume's covers: the edition to show first, then the alternatives. */
export type VolumeGroup = {
  volume: number;
  primary: MangaDexVolumeCover;
  variants: MangaDexVolumeCover[];
};

/**
 * MangaDex covers grouped by whole volume number. Within a volume the plain
 * volume ("3") leads its split parts ("3.5"), then the reader's language,
 * then the other of English and Japanese, then everything else.
 */
export function groupCovers({
  covers,
  japanese,
}: {
  covers: readonly MangaDexVolumeCover[];
  japanese: boolean;
}): VolumeGroup[] {
  const localeRank: Record<string, number> = japanese
    ? { ja: 0, en: 1 }
    : { en: 0, ja: 1 };
  const rankOf = (c: MangaDexVolumeCover): number => localeRank[c.locale] ?? 99;
  const isWhole = (c: MangaDexVolumeCover): boolean => !c.volume.includes(".");
  const byPreference = (a: MangaDexVolumeCover, b: MangaDexVolumeCover) =>
    Number(isWhole(b)) - Number(isWhole(a)) ||
    rankOf(a) - rankOf(b) ||
    a.volume.localeCompare(b.volume);

  const numbered = covers.flatMap((cover) => {
    const n = Number(cover.volume);
    return Number.isFinite(n) ? [{ volume: Math.floor(n), cover }] : [];
  });
  const volumes = [...new Set(numbered.map((n) => n.volume))].sort(
    (a, b) => a - b,
  );
  return volumes.map((volume) => {
    const [primary, ...variants] = numbered
      .filter((n) => n.volume === volume)
      .map((n) => n.cover)
      .sort(byPreference);
    return { volume, primary, variants };
  });
}
