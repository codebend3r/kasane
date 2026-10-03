import { describe, expect, it } from "bun:test";
import { hasBoundingRect } from "./guards";

describe("hasBoundingRect", () => {
  it("accepts a node that can measure itself", () => {
    expect(hasBoundingRect({ getBoundingClientRect: () => ({}) })).toBe(true);
  });

  it("rejects native refs, nulls and non-callable impostors", () => {
    expect(hasBoundingRect(null)).toBe(false);
    expect(hasBoundingRect({ measure: () => {} })).toBe(false);
    expect(hasBoundingRect({ getBoundingClientRect: "nope" })).toBe(false);
  });
});
