export const GRID_GAP = 8;
export const MIN_TILE_WIDTH = 150;
// The catalog screens pad their scroll content by 16 on each side.
export const GRID_PAGE_PADDING = 32;

export type GridLayout = { columns: number; tileWidth: number };

/** The widest tile that fits `columns` across `available`, gaps included. */
export const tileWidthFor = ({
  available,
  columns,
  gap = GRID_GAP,
}: {
  available: number;
  columns: number;
  gap?: number;
}): number =>
  Math.max(
    0,
    Math.floor((Math.max(0, available) - gap * (columns - 1)) / columns),
  );

/**
 * Column count and an exact tile width for a wrapped grid.
 *
 * Sizing tiles with `flexGrow` instead lets the final row stretch: a row of
 * five where every other row holds nineteen shares the full width between
 * those five, so the last row rendered visibly larger than the rest. Pinning
 * the width keeps every row identical and leaves the short row ragged, which
 * is what a grid should look like.
 */
export const gridLayout = ({
  available,
  minTile = MIN_TILE_WIDTH,
  gap = GRID_GAP,
}: {
  available: number;
  minTile?: number;
  gap?: number;
}): GridLayout => {
  const width = Math.max(0, available);
  const columns = Math.max(1, Math.floor((width + gap) / (minTile + gap)));
  return {
    columns,
    tileWidth: tileWidthFor({ available: width, columns, gap }),
  };
};

const RELEASE_COLUMNS = [
  { minWidth: 2400, columns: 12 },
  { minWidth: 2000, columns: 9 },
  { minWidth: 1700, columns: 8 },
  { minWidth: 1450, columns: 7 },
  { minWidth: 1200, columns: 6 },
  { minWidth: 1000, columns: 5 },
  { minWidth: 800, columns: 4 },
] as const;

/** Columns in the home screen's latest-releases grid for a window width. */
export const releaseColumns = (windowWidth: number): number =>
  RELEASE_COLUMNS.find((b) => windowWidth >= b.minWidth)?.columns ?? 3;
