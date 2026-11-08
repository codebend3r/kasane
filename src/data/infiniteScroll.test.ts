import { describe, expect, it } from "bun:test";
import { isNearEnd, uniqueMedia, wholeRows } from "@/data/infiniteScroll";
import { makeMedia } from "@test/fixtures/media";

describe("isNearEnd", () => {
  it("fires once the viewport reaches the load-ahead band", () => {
    expect(
      isNearEnd({ offset: 0, viewport: 800, content: 3000, ahead: 500 }),
    ).toBe(false);
    expect(
      isNearEnd({ offset: 1700, viewport: 800, content: 3000, ahead: 500 }),
    ).toBe(true);
  });

  it("fires when the content is shorter than the viewport", () => {
    expect(isNearEnd({ offset: 0, viewport: 900, content: 600 })).toBe(true);
  });

  // Before the first layout the viewport reads 0, which is not a real end.
  it("never fires before the viewport is measured", () => {
    expect(isNearEnd({ offset: 0, viewport: 0, content: 0 })).toBe(false);
  });
});

describe("uniqueMedia", () => {
  it("flattens pages in order and keeps the first copy of each id", () => {
    const pages = [
      [
        makeMedia({ id: 1, type: "ANIME" }),
        makeMedia({ id: 2, type: "ANIME" }),
      ],
      [
        makeMedia({ id: 2, type: "ANIME" }),
        makeMedia({ id: 3, type: "ANIME" }),
      ],
    ];
    expect(uniqueMedia(pages).map((m) => m.id)).toEqual([1, 2, 3]);
  });

  it("returns nothing for no pages", () => {
    expect(uniqueMedia([])).toEqual([]);
  });
});

describe("wholeRows", () => {
  const items = [1, 2, 3, 4, 5, 6, 7];

  it("drops the short last row while more is coming", () => {
    expect(wholeRows({ items, columns: 3, complete: false })).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("keeps everything once the feed is complete", () => {
    expect(wholeRows({ items, columns: 3, complete: true })).toEqual(items);
  });

  it("keeps everything for a nonsensical column count", () => {
    expect(wholeRows({ items, columns: 0, complete: false })).toEqual(items);
  });
});
