import { afterEach, describe, expect, it } from "bun:test";
import { applySearchAlias, setSearchAliases } from "./searchAliases";

// The alias table is a module-level singleton shared across the test process —
// always leave it empty for the next file.
afterEach(() => {
  setSearchAliases({});
});

describe("applySearchAlias", () => {
  it("passes a query through when no alias matches", () => {
    expect(applySearchAlias("Naruto")).toBe("Naruto");
  });

  it("normalizes case, whitespace and punctuation before the lookup", () => {
    setSearchAliases({ aot: "Attack on Titan" });
    expect(applySearchAlias("  A.o.T! ")).toBe("Attack on Titan");
  });

  it("returns the original query untouched on a miss, not the normalized key", () => {
    setSearchAliases({ aot: "Attack on Titan" });
    expect(applySearchAlias(" Spy x Family ")).toBe(" Spy x Family ");
  });
});

describe("setSearchAliases", () => {
  it("replaces the whole table rather than merging", () => {
    setSearchAliases({ aot: "Attack on Titan" });
    setSearchAliases({ mha: "My Hero Academia" });
    expect(applySearchAlias("aot")).toBe("aot");
    expect(applySearchAlias("mha")).toBe("My Hero Academia");
  });
});
