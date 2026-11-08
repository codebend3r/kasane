import { describe, expect, it } from "bun:test";
import { useLatestAnime, useSearch } from "@/queries/search";
import { graphqlRequestMock } from "@test/mocks/graphql";
import { serveCatalog } from "@test/fixtures/catalog";
import { makeMedia } from "@test/fixtures/media";
import { last, renderHook, settle } from "@test/renderHook";
import type { SplitFilters } from "@/data/genreFilters";

const filters: SplitFilters = { genreNotIn: ["Hentai"], tagNotIn: null };

// Answers both the latest-anime page and the search request.
const emptyPage = () =>
  Promise.resolve({
    Page: { pageInfo: { hasNextPage: false }, media: [] },
    search: { media: [] },
  });

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
        ids: [16498, 53390],
        hasCatalog: true,
        genreNotIn: ["Hentai"],
        tagNotIn: null,
      });
    } finally {
      unmount();
    }
  });

  it("leads with catalog series whose title matches the query", async () => {
    serveCatalog({});
    const aot = makeMedia({ id: 16498, type: "ANIME" });
    const other = makeMedia({ id: 55391, type: "MANGA", title: "Attack!!" });
    graphqlRequestMock.mockImplementation((_doc, variables) =>
      Promise.resolve(
        variables?.hasCatalog
          ? { search: { media: [other] }, catalog: { media: [aot] } }
          : { search: { media: [other] } },
      ),
    );
    const { captures, unmount } = renderHook(() =>
      useSearch({ query: "attack", filters, enabled: true }),
    );
    try {
      await settle(
        () => (last(captures).data ?? []).some((m) => m.id === 16498),
        "the catalog match",
      );
      expect((last(captures).data ?? []).map((m) => m.id)).toEqual([
        16498, 55391,
      ]);
      expect(graphqlRequestMock.mock.calls.at(-1)?.[1]).toEqual({
        query: "attack",
        ids: [16498, 53390],
        hasCatalog: true,
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
  it("fetches the next page only when asked, and stops at the last", async () => {
    graphqlRequestMock
      .mockResolvedValueOnce({
        Page: {
          pageInfo: { hasNextPage: true },
          media: [makeMedia({ id: 1, type: "ANIME" })],
        },
      })
      .mockResolvedValueOnce({
        Page: {
          pageInfo: { hasNextPage: false },
          media: [makeMedia({ id: 2, type: "ANIME" })],
        },
      });
    const { captures, unmount } = renderHook(() =>
      useLatestAnime({ filters, enabled: true }),
    );
    try {
      await settle(() => last(captures).isSuccess, "the first page");
      expect(last(captures).hasNextPage).toBe(true);
      expect(graphqlRequestMock).toHaveBeenCalledTimes(1);

      await last(captures).fetchNextPage();
      await settle(
        () => last(captures).data?.pages.length === 2,
        "the second page",
      );
      expect(graphqlRequestMock.mock.calls[1]?.[1]).toMatchObject({ page: 2 });
      expect(last(captures).hasNextPage).toBe(false);
    } finally {
      unmount();
    }
  });

  it("passes the hidden genres through to AniList", async () => {
    graphqlRequestMock.mockImplementation(emptyPage);
    const { captures, unmount } = renderHook(() =>
      useLatestAnime({ filters, enabled: true }),
    );
    try {
      await settle(() => last(captures).isSuccess, "the latest anime");
      expect(graphqlRequestMock.mock.calls[0]?.[1]).toEqual({
        page: 1,
        genreNotIn: ["Hentai"],
        tagNotIn: null,
      });
    } finally {
      unmount();
    }
  });
});
