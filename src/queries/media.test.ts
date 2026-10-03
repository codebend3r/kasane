import { describe, expect, it } from "bun:test";
import {
  useFranchise,
  useMangaDex,
  useMedia,
  useMediaByIds,
} from "@/queries/media";
import { graphqlRequestMock } from "@test/mocks/graphql";
import { makeEdge, makeMedia } from "@test/fixtures/media";
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

describe("useFranchise", () => {
  it("skips the walk for an anime with no sequels", () => {
    const standalone = makeMedia({ id: 1, type: "ANIME" });
    const { captures, unmount } = renderHook(() => useFranchise(standalone));
    try {
      expect(last(captures).fetchStatus).toBe("idle");
      expect(graphqlRequestMock).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it("walks the franchise for an anime with a sequel", async () => {
    const root = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [makeEdge({ relationType: "SEQUEL", id: 2, type: "ANIME" })],
    });
    graphqlRequestMock.mockResolvedValueOnce({
      Page: {
        media: [
          {
            id: 1,
            title: { romaji: "Root", english: null },
            format: "TV",
            episodes: 12,
            startDate: { year: 2020 },
            relations: { edges: [] },
          },
        ],
      },
    });
    const { captures, unmount } = renderHook(() => useFranchise(root));
    try {
      await settle(() => last(captures).isSuccess, "the franchise");
      expect(last(captures).data?.totalTvEpisodes).toBe(12);
    } finally {
      unmount();
    }
  });
});

describe("useMangaDex", () => {
  it("waits without a request while the manga is unknown", () => {
    const { captures, unmount } = renderHook(() => useMangaDex(null));
    try {
      expect(last(captures).fetchStatus).toBe("idle");
    } finally {
      unmount();
    }
  });
});
