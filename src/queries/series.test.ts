import { describe, expect, it } from "bun:test";
import { useSeries } from "@/queries/series";
import { serveCatalog, seriesMapping } from "@test/fixtures/catalog";
import { makeEdge, makeMedia } from "@test/fixtures/media";
import { graphqlRequestMock } from "@test/mocks/graphql";
import { last, renderHook, settle } from "@test/renderHook";
import type { AniListMedia, AniListMediaDetail } from "@/types";

const detail = (media: AniListMedia): AniListMediaDetail => ({
  ...media,
  description: null,
});

/** Answers each detail query with the media whose id it asks for. */
const serveMedia = (media: readonly AniListMediaDetail[]): void => {
  graphqlRequestMock.mockImplementation((_query, variables) => {
    const hit = media.find((m) => m.id === (variables?.id ?? null));
    return hit
      ? Promise.resolve({ Media: hit })
      : Promise.reject(
          new Error(`no media fixture for ${String(variables?.id ?? null)}`),
        );
  });
};

describe("useSeries", () => {
  it("pairs a curated anime with the manga its mapping names", async () => {
    serveCatalog({});
    // AniList has no SOURCE relation here; the catalog still names the manga.
    const anime = detail(makeMedia({ id: 16498, type: "ANIME" }));
    const manga = detail(makeMedia({ id: 53390, type: "MANGA" }));
    serveMedia([anime, manga]);
    const { captures, unmount } = renderHook(() => useSeries(16498));
    try {
      await settle(
        () => (last(captures).entry?.manga ?? null) !== null,
        "the partner to load",
      );
      expect(last(captures)).toEqual({
        entry: { routeId: 53390, primary: manga, manga, anime, badge: "both" },
        resolved: { source: "curated", mapping: seriesMapping },
        isLoading: false,
      });
    } finally {
      unmount();
    }
  });

  it("pairs an uncurated anime through AniList and estimates its mapping", async () => {
    serveCatalog({});
    const anime = detail(
      makeMedia({
        id: 1,
        type: "ANIME",
        episodes: 12,
        relations: [
          makeEdge({
            relationType: "SOURCE",
            id: 2,
            type: "MANGA",
            chapters: 40,
          }),
        ],
      }),
    );
    const manga = detail(makeMedia({ id: 2, type: "MANGA", chapters: 40 }));
    serveMedia([anime, manga]);
    const { captures, unmount } = renderHook(() => useSeries(1));
    try {
      await settle(
        () =>
          (last(captures).entry?.manga ?? null) !== null &&
          last(captures).resolved !== null,
        "the partner and the estimate",
      );
      expect(last(captures).entry).toEqual({
        routeId: 2,
        primary: manga,
        manga,
        anime,
        badge: "both",
      });
      expect(last(captures).resolved?.source ?? null).toBe("estimated");
    } finally {
      unmount();
    }
  });

  it("has no entry while the id is unknown", () => {
    serveCatalog({});
    const { captures, unmount } = renderHook(() => useSeries(null));
    try {
      expect(last(captures)).toEqual({
        entry: null,
        resolved: null,
        isLoading: false,
      });
      expect(graphqlRequestMock).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
