import { describe, expect, it } from "bun:test";
import {
  useCatalog,
  useGenreFilters,
  useMapping,
  useSearchAliases,
} from "@/queries/catalog";
import { serveCatalog, seriesMapping } from "@test/fixtures/catalog";
import { last, renderHook, settle } from "@test/renderHook";

describe("useCatalog", () => {
  it("resolves a series by either id once the catalog loads", async () => {
    serveCatalog({});
    const { captures, unmount } = renderHook(useCatalog);
    try {
      expect(captures[0].isLoaded).toBe(false);
      expect(captures[0].findMapping(16498)).toBeNull();

      await settle(() => last(captures).isLoaded, "the catalog to load");

      const catalog = last(captures);
      expect(catalog.mappings).toEqual([seriesMapping]);
      expect(catalog.findMapping(16498)).toEqual(seriesMapping);
      expect(catalog.findMapping(53390)).toEqual(seriesMapping);
      expect(catalog.findMapping(999999)).toBeNull();
    } finally {
      unmount();
    }
  });

  // Screens list `findMapping` in `useMemo` dependencies; a fresh function on
  // every render would quietly defeat that memoisation.
  it("hands back the same accessor across renders of one payload", async () => {
    serveCatalog({});
    const { captures, rerender, unmount } = renderHook(useCatalog);
    try {
      await settle(() => last(captures).isLoaded, "the catalog to load");
      const before = last(captures);
      rerender();
      expect(last(captures)).toBe(before);
    } finally {
      unmount();
    }
  });
});

describe("useMapping", () => {
  it("is null before the catalog loads, then resolves by media id", async () => {
    serveCatalog({});
    const { captures, unmount } = renderHook(() => useMapping(53390));
    try {
      expect(captures[0]).toBeNull();
      await settle(() => last(captures) !== null, "the mapping to resolve");
      expect(last(captures)).toEqual(seriesMapping);
    } finally {
      unmount();
    }
  });
});

describe("useGenreFilters", () => {
  it("is the catalog's genre chips in table order", async () => {
    serveCatalog({});
    const { captures, unmount } = renderHook(useGenreFilters);
    try {
      await settle(() => last(captures).length > 0, "the genre filters");
      expect(last(captures).map((f) => f.id)).toEqual([
        "hentai",
        "ecchi",
        "odd",
      ]);
    } finally {
      unmount();
    }
  });
});

describe("useSearchAliases", () => {
  it("is empty until the catalog lands, then holds the alias table", async () => {
    serveCatalog({ aliases: [{ alias: "aot", target: "Attack on Titan" }] });
    const { captures, unmount } = renderHook(useSearchAliases);
    try {
      expect(captures[0]).toEqual({});
      await settle(
        () => Object.keys(last(captures)).length > 0,
        "the aliases to load",
      );
      expect(last(captures)).toEqual({ aot: "Attack on Titan" });
    } finally {
      unmount();
    }
  });
});
