// `@/api/supabase` is replaced with the mocks from `@test/mocks/supabase` by the
// bun test preload in `test/setup.ts`.
import { describe, expect, it } from "bun:test";
import { fetchCachedMangaDex } from "./mangadexCache";
import { fromMock, singleRowOf } from "@test/mocks/supabase";
import type { MangaDexSeriesRow } from "@/data/mangadexSnapshot";

const row: MangaDexSeriesRow = {
  id: 7,
  anilist_manga_id: 30011,
  mangadex_id: "m1",
  titles: [{ locale: "en", value: "Naruto" }],
  covers: [{ volume: "1", locale: "ja", fileName: "a.png" }],
  volumes: 72,
  chapters: 700,
  fetched_at: "2026-11-08T00:00:00Z",
  created_at: "2026-11-08T00:00:00Z",
  updated_at: "2026-11-08T00:00:00Z",
};

describe("fetchCachedMangaDex", () => {
  it("reads the cached row for the manga and lifts it into a snapshot", async () => {
    fromMock.mockImplementationOnce(() => singleRowOf(row));
    expect(await fetchCachedMangaDex(30011)).toEqual({
      mangadexId: "m1",
      titles: [{ locale: "en", value: "Naruto" }],
      volumes: 72,
      chapters: 700,
      covers: [{ volume: "1", locale: "ja", fileName: "a.png" }],
    });
    expect(fromMock).toHaveBeenCalledWith("mangadex_series");
  });

  it("resolves null for a manga the cache has no row for", async () => {
    fromMock.mockImplementationOnce(() => singleRowOf(null));
    expect(await fetchCachedMangaDex(1)).toBeNull();
  });

  it("surfaces a query error", async () => {
    fromMock.mockImplementationOnce(() =>
      singleRowOf(null, { message: "down" }),
    );
    expect(fetchCachedMangaDex(1)).rejects.toEqual({ message: "down" });
  });
});
