export const GRID_GAP = 8;
export const MIN_TILE_WIDTH = 150;
// The catalog screens pad their scroll content by 16 on each side.
export const GRID_PAGE_PADDING = 32;

export type GridLayout = { columns: number; tileWidth: number };

/**
 * Column count and an exact tile width for a wrapped grid.
 *
 * Sizing tiles with `flexGrow` instead lets the final row stretch: a row of
 * five where every other row holds nineteen shares the full width between
 * those five, so the last row rendered visibly larger than the rest. Pinning
 * the width keeps every row identical and leaves the short row ragged, which
 * is what a grid should look like.
 */
export const gridLayout = (
  available: number,
  minTile: number = MIN_TILE_WIDTH,
  gap: number = GRID_GAP,
): GridLayout => {
  const width = Math.max(0, available);
  const columns = Math.max(1, Math.floor((width + gap) / (minTile + gap)));
  return {
    columns,
    tileWidth: Math.max(0, Math.floor((width - gap * (columns - 1)) / columns)),
  };
};
