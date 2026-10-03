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
});
