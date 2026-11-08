import { describe, expect, it } from "bun:test";
import { hasBoundingRect, isRecord } from "./guards";

describe("isRecord", () => {
  it("accepts a plain object", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it("rejects null, arrays and primitives", () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(isRecord("a")).toBe(false);
    expect(isRecord(1)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
  });
});

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
