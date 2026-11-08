import type { AniListMedia } from "@/types";

/** How close to the end of the content, in points, the next page loads. */
export const LOAD_AHEAD = 800;

/** True once the viewport's bottom edge is within `ahead` of the content's. */
export function isNearEnd({
  offset,
  viewport,
  content,
  ahead = LOAD_AHEAD,
}: {
  offset: number;
  viewport: number;
  content: number;
  ahead?: number;
}): boolean {
  return viewport > 0 && offset + viewport >= content - ahead;
}

/**
 * Every page's media in order, each id once. A title can shift between pages
 * while the feed is being read, and the second copy would repeat a tile.
 */
export function uniqueMedia(pages: readonly AniListMedia[][]): AniListMedia[] {
  const seen = new Set<number>();
  return pages.flat().filter((m) => !seen.has(m.id) && !!seen.add(m.id));
}

/**
 * `items` cut to whole rows of `columns`, so the grid never ends on a short
 * row while more is coming. Once the feed is `complete` the last row stays.
 */
export function wholeRows<T>({
  items,
  columns,
  complete,
}: {
  items: readonly T[];
  columns: number;
  complete: boolean;
}): T[] {
  if (complete || columns < 1) return [...items];
  return items.slice(0, Math.floor(items.length / columns) * columns);
}
