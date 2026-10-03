import { describe, expect, it } from "bun:test";
import { gridLayout, releaseColumns, tileWidthFor } from "@/data/gridLayout";

describe("gridLayout", () => {
  it("fits as many minimum-width tiles as the row allows", () => {
    // 358 = a 390pt phone less the 16pt page padding on each side.
    expect(gridLayout({ available: 358 }).columns).toBe(2);
    expect(gridLayout({ available: 1408 }).columns).toBe(8);
    // An ultrawide monitor, where the stretched last row was first spotted.
    expect(gridLayout({ available: 2928 }).columns).toBe(18);
  });

  it("divides the row exactly, gaps included", () => {
    const { columns, tileWidth } = gridLayout({ available: 1408 });
    expect(columns * tileWidth + (columns - 1) * 8).toBeLessThanOrEqual(1408);
    expect(tileWidth).toBeGreaterThanOrEqual(150);
  });

  it("keeps one column when the row cannot fit even a single tile", () => {
    expect(gridLayout({ available: 80 })).toEqual({
      columns: 1,
      tileWidth: 80,
    });
  });

  // useWindowDimensions reports 0 on the first render of some web layouts.
  it("never returns a negative width", () => {
    expect(gridLayout({ available: 0 })).toEqual({ columns: 1, tileWidth: 0 });
    expect(gridLayout({ available: -40 })).toEqual({
      columns: 1,
      tileWidth: 0,
    });
  });
});

describe("tileWidthFor", () => {
  it("shares the row between a fixed column count, gaps included", () => {
    // Four columns and three 16pt gaps across 1248: (1248 - 48) / 4.
    expect(tileWidthFor({ available: 1248, columns: 4, gap: 16 })).toBe(300);
  });

  it("rounds down so the row never overflows", () => {
    expect(tileWidthFor({ available: 1000, columns: 3, gap: 16 })).toBe(322);
  });
});

describe("releaseColumns", () => {
  it("steps up with the window width", () => {
    expect(releaseColumns(700)).toBe(3);
    expect(releaseColumns(800)).toBe(4);
    expect(releaseColumns(1280)).toBe(6);
    expect(releaseColumns(2560)).toBe(12);
  });
});
