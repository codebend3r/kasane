// `@/api/supabase` is replaced with the mocks from `@test/mocks/supabase` by the
// bun test preload in `test/setup.ts`; the fixture rows are served through
// `fromMock`.
import { describe, expect, it } from "bun:test";
import { fetchCatalog } from "./catalog";
import { serveCatalog, seriesMapping } from "@test/fixtures/catalog";

describe("fetchCatalog", () => {
  it("assembles mappings, aliases and genre filters from the three tables", async () => {
    serveCatalog({ aliases: [{ alias: "aot", target: "Attack on Titan" }] });
    expect(await fetchCatalog()).toEqual({
      mappings: [seriesMapping],
      aliases: { aot: "Attack on Titan" },
      genreFilters: [
        { id: "hentai", kind: "genre", label: "Hentai", token: "Hentai" },
        { id: "ecchi", kind: "tag", label: "Ecchi", token: "Ecchi" },
        { id: "odd", kind: "genre", label: "Odd", token: "Odd" },
      ],
    });
  });
});
