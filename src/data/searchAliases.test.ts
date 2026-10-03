import { describe, expect, it } from "bun:test";
import { applySearchAlias } from "./searchAliases";

const aliases = { aot: "Attack on Titan" };

describe("applySearchAlias", () => {
  it("passes a query through when no alias matches", () => {
    expect(applySearchAlias({ query: "Naruto", aliases })).toBe("Naruto");
  });

  it("passes every query through before the alias table loads", () => {
    expect(applySearchAlias({ query: "aot", aliases: {} })).toBe("aot");
  });

  it("normalizes case, whitespace and punctuation before the lookup", () => {
    expect(applySearchAlias({ query: "  A.o.T! ", aliases })).toBe(
      "Attack on Titan",
    );
  });

  it("returns the original query untouched on a miss, not the normalized key", () => {
    expect(applySearchAlias({ query: " Spy x Family ", aliases })).toBe(
      " Spy x Family ",
    );
  });
});
