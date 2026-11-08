import { describe, expect, it } from "bun:test";
import { getLatestAnime, searchWithCatalog } from "./anilist";
// `graphql-request` is replaced with this mock by the preload in
// `test/setup.ts`, so every request below is served from fixtures.
import { graphqlRequestMock } from "@test/mocks/graphql";
import { makeEdge, makeMedia } from "@test/fixtures/media";

const page = (media: unknown[], hasNextPage = false) => ({
  Page: { pageInfo: { hasNextPage }, media },
});

describe("getLatestAnime franchise-root filtering", () => {
  it("drops seasons whose prequel or parent is another anime series", async () => {
    const root = makeMedia({ id: 1, type: "ANIME" });
    const laterSeason = makeMedia({
      id: 2,
      type: "ANIME",
      relations: [
        makeEdge({
          relationType: "PREQUEL",
          id: 1,
          type: "ANIME",
          format: "TV",
        }),
      ],
    });
    const childOfUnknownFormat = makeMedia({
      id: 3,
      type: "ANIME",
      relations: [
        makeEdge({
          relationType: "PARENT",
          id: 1,
          type: "ANIME",
          format: null,
        }),
      ],
    });
    // A music-video "prequel" is not a real predecessor season.
    const musicPrequel = makeMedia({
      id: 4,
      type: "ANIME",
      relations: [
        makeEdge({
          relationType: "PREQUEL",
          id: 9,
          type: "ANIME",
          format: "MUSIC",
        }),
      ],
    });
    // A manga prequel does not make the anime a non-root.
    const mangaPrequel = makeMedia({
      id: 5,
      type: "ANIME",
      relations: [
        makeEdge({
          relationType: "PREQUEL",
          id: 8,
          type: "MANGA",
          format: "MANGA",
        }),
      ],
    });

    graphqlRequestMock.mockResolvedValueOnce(
      page([
        root,
        laterSeason,
        childOfUnknownFormat,
        musicPrequel,
        mangaPrequel,
      ]),
    );

    const latest = await getLatestAnime({
      filters: { genreNotIn: null, tagNotIn: null },
      page: 1,
    });
    expect(latest.media.map((m) => m.id)).toEqual([1, 4, 5]);
  });

  it("requests the given page and reports whether another follows", async () => {
    graphqlRequestMock.mockResolvedValueOnce(page([], true));

    const latest = await getLatestAnime({
      filters: { genreNotIn: ["Hentai"], tagNotIn: null },
      page: 3,
    });
    expect(latest.hasNextPage).toBe(true);
    expect(graphqlRequestMock.mock.calls.at(-1)?.[1]).toEqual({
      page: 3,
      genreNotIn: ["Hentai"],
      tagNotIn: null,
    });
  });
});

describe("searchWithCatalog", () => {
  const filters = { genreNotIn: ["Hentai"], tagNotIn: ["Gore"] };

  it("skips the catalog page when there are no catalog ids", async () => {
    const hit = makeMedia({ id: 55391, type: "MANGA" });
    graphqlRequestMock.mockImplementation(() =>
      Promise.resolve({ search: { media: [hit] } }),
    );
    expect(
      await searchWithCatalog({ query: "attack", ids: [], filters }),
    ).toEqual({ search: [hit], catalog: [] });
    expect(graphqlRequestMock.mock.calls.at(-1)?.[1]).toEqual({
      query: "attack",
      ids: [],
      hasCatalog: false,
      ...filters,
    });
  });

  it("fetches search and catalog ids in one request", async () => {
    const hit = makeMedia({ id: 55391, type: "MANGA" });
    const aot = makeMedia({ id: 16498, type: "ANIME" });
    graphqlRequestMock.mockImplementation(() =>
      Promise.resolve({ search: { media: [hit] }, catalog: { media: [aot] } }),
    );
    expect(
      await searchWithCatalog({
        query: "attack",
        ids: [16498, 53390],
        filters,
      }),
    ).toEqual({ search: [hit], catalog: [aot] });
    expect(graphqlRequestMock).toHaveBeenCalledTimes(1);
    expect(graphqlRequestMock.mock.calls.at(-1)?.[1]).toEqual({
      query: "attack",
      ids: [16498, 53390],
      hasCatalog: true,
      ...filters,
    });
  });
});
