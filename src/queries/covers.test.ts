import { describe, expect, it } from "bun:test";
import { useCovers } from "@/queries/covers";
import { graphqlRequestMock } from "@test/mocks/graphql";
import { last, renderHook, settle } from "@test/renderHook";

describe("useCovers", () => {
  it("keys each cover by its media id", async () => {
    graphqlRequestMock.mockResolvedValueOnce({
      Page: {
        media: [
          { id: 1, coverImage: { large: "https://img/1.png", color: "#111" } },
          { id: 2, coverImage: { large: "https://img/2.png", color: null } },
        ],
      },
    });
    const { captures, unmount } = renderHook(() => useCovers([1, 2]));
    try {
      expect(captures[0]).toEqual({});
      await settle(() => Object.keys(last(captures)).length > 0, "covers");
      expect(last(captures)).toEqual({
        1: { url: "https://img/1.png", color: "#111" },
        2: { url: "https://img/2.png", color: null },
      });
    } finally {
      unmount();
    }
  });

  it("asks AniList for nothing when there are no ids", () => {
    const { captures, unmount } = renderHook(() => useCovers([]));
    try {
      expect(last(captures)).toEqual({});
      expect(graphqlRequestMock).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it("keeps two id sets apart even when their counts and sums match", async () => {
    const cover = (id: number) => ({
      id,
      coverImage: { large: `https://img/${id}.png`, color: null },
    });
    graphqlRequestMock.mockImplementation((_query, variables) => {
      const ids = variables?.ids ?? [];
      return Promise.resolve({
        Page: { media: Array.isArray(ids) ? ids.map(cover) : [] },
      });
    });
    const { captures, unmount } = renderHook(() => ({
      first: useCovers([1, 4]),
      second: useCovers([2, 3]),
    }));
    try {
      await settle(
        () =>
          Object.keys(last(captures).first).length > 0 &&
          Object.keys(last(captures).second).length > 0,
        "both cover sets",
      );
      expect(Object.keys(last(captures).first)).toEqual(["1", "4"]);
      expect(Object.keys(last(captures).second)).toEqual(["2", "3"]);
    } finally {
      unmount();
    }
  });

  it("shares one request between the same ids in another order", async () => {
    graphqlRequestMock.mockResolvedValue({ Page: { media: [] } });
    const { unmount } = renderHook(() => ({
      first: useCovers([3, 1, 2]),
      second: useCovers([1, 2, 3, 3]),
    }));
    try {
      await settle(() => graphqlRequestMock.mock.calls.length > 0, "a request");
      expect(graphqlRequestMock).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
    }
  });
});
