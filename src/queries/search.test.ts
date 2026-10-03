import { describe, expect, it } from "bun:test";
import { useLatestAnime, useSearch } from "@/queries/search";
import { graphqlRequestMock } from "@test/mocks/graphql";
import { serveCatalog } from "@test/fixtures/catalog";
import { last, renderHook, settle } from "@test/renderHook";
import type { SplitFilters } from "@/data/genreFilters";

const filters: SplitFilters = { genreNotIn: ["Hentai"], tagNotIn: null };

const emptyPage = () => Promise.resolve({ Page: { media: [] } });

const searchedTerms = (): unknown[] =>
  graphqlRequestMock.mock.calls.map(([, variables]) => variables?.query);

describe("useSearch", () => {
  it("searches AniList for the aliased term once the aliases land", async () => {
    serveCatalog({ aliases: [{ alias: "aot", target: "Attack on Titan" }] });
    graphqlRequestMock.mockImplementation(emptyPage);
    const { captures, unmount } = renderHook(() =>
      useSearch({ query: "aot", filters, enabled: true }),
    );
    try {
      await settle(
        () => searchedTerms().includes("Attack on Titan"),
        "the aliased search",
      );
      await settle(() => last(captures).isSuccess, "the search to settle");
      expect(graphqlRequestMock.mock.calls.at(-1)?.[1]).toEqual({
        query: "Attack on Titan",
        genreNotIn: ["Hentai"],
        tagNotIn: null,
      });
    } finally {
      unmount();
    }
  });

  it("sends nothing while disabled", async () => {
    serveCatalog({});
    const { captures, unmount } = renderHook(() =>
      useSearch({ query: "aot", filters, enabled: false }),
    );
    try {
      expect(last(captures).fetchStatus).toBe("idle");
      expect(graphqlRequestMock).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});

describe("useLatestAnime", () => {
  it("passes the hidden genres through to AniList", async () => {
    graphqlRequestMock.mockImplementation(emptyPage);
    const { captures, unmount } = renderHook(() =>
      useLatestAnime({ filters, enabled: true }),
    );
    try {
      await settle(() => last(captures).isSuccess, "the latest anime");
      expect(graphqlRequestMock.mock.calls[0]?.[1]).toEqual({
        genreNotIn: ["Hentai"],
        tagNotIn: null,
      });
    } finally {
      unmount();
    }
  });
});
