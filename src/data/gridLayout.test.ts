import { describe, expect, it } from "bun:test";
import { gridLayout } from "@/data/gridLayout";

describe("gridLayout", () => {
  it("fits as many minimum-width tiles as the row allows", () => {
    // 358 = a 390pt phone less the 16pt page padding on each side.
    expect(gridLayout(358).columns).toBe(2);
    expect(gridLayout(1408).columns).toBe(8);
    // An ultrawide monitor, where the stretched last row was first spotted.
    expect(gridLayout(2928).columns).toBe(18);
  });

  it("divides the row exactly, gaps included", () => {
    const { columns, tileWidth } = gridLayout(1408);
    expect(columns * tileWidth + (columns - 1) * 8).toBeLessThanOrEqual(1408);
    expect(tileWidth).toBeGreaterThanOrEqual(150);
  });

  it("keeps one column when the row cannot fit even a single tile", () => {
    expect(gridLayout(80)).toEqual({ columns: 1, tileWidth: 80 });
  });

  // useWindowDimensions reports 0 on the first render of some web layouts.
  it("never returns a negative width", () => {
    expect(gridLayout(0)).toEqual({ columns: 1, tileWidth: 0 });
    expect(gridLayout(-40)).toEqual({ columns: 1, tileWidth: 0 });
  });
});
