import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { useMangaDex, useMedia, useMediaByIds } from "@/queries/media";
import { graphqlRequestMock } from "@test/mocks/graphql";
import { fromMock, singleRowOf } from "@test/mocks/supabase";
import { makeMedia } from "@test/fixtures/media";
import type { MangaDexSeriesRow } from "@/data/mangadexSnapshot";
import { last, renderHook, settle } from "@test/renderHook";

describe("useMedia", () => {
  it("waits without a request while the id is unknown", () => {
    const { captures, unmount } = renderHook(() => useMedia(null));
    try {
      expect(last(captures).fetchStatus).toBe("idle");
      expect(graphqlRequestMock).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it("fetches the entry once the id is known", async () => {
    const anime = {
      ...makeMedia({ id: 5114, type: "ANIME" }),
      description: null,
    };
    graphqlRequestMock.mockResolvedValueOnce({ Media: anime });
    const { captures, unmount } = renderHook(() => useMedia(5114));
    try {
      await settle(() => last(captures).isSuccess, "the media to load");
      expect(last(captures).data).toEqual(anime);
      expect(graphqlRequestMock.mock.calls[0]?.[1]).toEqual({ id: 5114 });
    } finally {
      unmount();
    }
  });
});

describe("useMediaByIds", () => {
  it("asks AniList for nothing when there are no ids", () => {
    const { captures, unmount } = renderHook(() => useMediaByIds([]));
    try {
      expect(last(captures).fetchStatus).toBe("idle");
      expect(graphqlRequestMock).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});

const cachedRow: MangaDexSeriesRow = {
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

describe("useMangaDex", () => {
  const manga = makeMedia({ id: 30011, type: "MANGA" });
  const fetchSpy = spyOn(globalThis, "fetch");
  afterEach(() => {
    fetchSpy.mockReset();
  });

  it("waits without a request while the manga is unknown", () => {
    const { captures, unmount } = renderHook(() => useMangaDex(null));
    try {
      expect(last(captures).fetchStatus).toBe("idle");
    } finally {
      unmount();
    }
  });

  it("serves a cached series without touching MangaDex", async () => {
    fromMock.mockImplementationOnce(() => singleRowOf(cachedRow));
    const { captures, unmount } = renderHook(() => useMangaDex(manga));
    try {
      await settle(() => last(captures).isSuccess, "the cached lookup");
      const info = last(captures).data;
      expect(info?.volumes).toBe(72);
      expect(info?.covers[0]?.thumbUrl).toBe(
        "https://uploads.mangadex.org/covers/m1/a.png.256.jpg",
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it("falls back to the live lookup when the cache has no row", async () => {
    fromMock.mockImplementationOnce(() => singleRowOf(null));
    fetchSpy.mockResolvedValueOnce(Response.json({ data: [] }));
    const { captures, unmount } = renderHook(() => useMangaDex(manga));
    try {
      await settle(() => last(captures).isSuccess, "the live lookup");
      expect(last(captures).data).toBeNull();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(String(fetchSpy.mock.calls[0]?.[0])).toContain("/manga?title=");
    } finally {
      unmount();
    }
  });

  it("falls back to the live lookup when the cache read fails", async () => {
    fromMock.mockImplementationOnce(() =>
      singleRowOf(null, { message: "relation does not exist" }),
    );
    fetchSpy.mockResolvedValueOnce(Response.json({ data: [] }));
    const { captures, unmount } = renderHook(() => useMangaDex(manga));
    try {
      await settle(() => last(captures).isSuccess, "the live lookup");
      expect(last(captures).data).toBeNull();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
    }
  });
});
