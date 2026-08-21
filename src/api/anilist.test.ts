import { afterEach, describe, expect, it } from "bun:test";
import { getAnimeFranchise, getLatestAnime, hasAnimeSequels } from "./anilist";
// `graphql-request` is replaced with this mock by the preload in
// `test/setup.ts`, so every request below is served from fixtures.
import { graphqlRequestMock } from "@test/mocks/graphql";
import type { AniListMedia, MediaType, RelationEdge } from "@/types";

const makeMedia = ({
  id,
  type,
  relations,
}: {
  id: number;
  type: MediaType;
  relations?: RelationEdge[];
}): AniListMedia => ({
  id,
  type,
  title: { romaji: `Media ${id}`, english: null, native: null },
  coverImage: { large: "https://img.example/cover.png", color: null },
  description: null,
  episodes: null,
  chapters: null,
  volumes: null,
  status: null,
  format: null,
  countryOfOrigin: null,
  synonyms: [],
  genres: [],
  startDate: { year: null },
  ...(relations ? { relations: { edges: relations } } : {}),
});

// Shape returned by `FRANCHISE_NODE_QUERY`.
type FranchiseNodeFixture = {
  id: number;
  title: { romaji: string; english: string | null };
  format: string | null;
  episodes: number | null;
  startDate: { year: number | null };
  relations: {
    edges: { relationType: string; node: { id: number; type: MediaType } }[];
  };
};

const franchiseNode = ({
  id,
  format,
  episodes,
  year,
  edges = [],
}: {
  id: number;
  format: string | null;
  episodes: number | null;
  year: number | null;
  edges?: { relationType: string; node: { id: number; type: MediaType } }[];
}): FranchiseNodeFixture => ({
  id,
  title: { romaji: `Season ${id}`, english: null },
  format,
  episodes,
  startDate: { year },
  relations: { edges },
});

const page = (media: unknown[]) => ({ Page: { media } });

afterEach(() => {
  graphqlRequestMock.mockClear();
});

describe("hasAnimeSequels", () => {
  it("detects an anime sequel relation", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [{ relationType: "SEQUEL", node: { id: 2, type: "ANIME" } }],
    });
    expect(hasAnimeSequels(anime)).toBe(true);
  });

  it("ignores sequel relations pointing at manga", () => {
    const anime = makeMedia({
      id: 1,
      type: "ANIME",
      relations: [{ relationType: "SEQUEL", node: { id: 2, type: "MANGA" } }],
    });
    expect(hasAnimeSequels(anime)).toBe(false);
  });

  it("is false for manga even with anime sequel edges", () => {
    const manga = makeMedia({
      id: 1,
      type: "MANGA",
      relations: [{ relationType: "SEQUEL", node: { id: 2, type: "ANIME" } }],
    });
    expect(hasAnimeSequels(manga)).toBe(false);
  });

  it("is false with no relations at all", () => {
    expect(hasAnimeSequels(makeMedia({ id: 1, type: "ANIME" }))).toBe(false);
  });
});

describe("getAnimeFranchise", () => {
  it("walks sequels and side stories, summing TV episodes only", async () => {
    // Root (2013, TV 25) → SEQUEL season 2 (2015, TV 12) and SIDE_STORY
    // OVA (2016, 1 ep). The sequel points back at the root, which must not
    // trigger a third fetch, and manga edges must be ignored.
    graphqlRequestMock
      .mockResolvedValueOnce(
        page([
          franchiseNode({
            id: 1,
            format: "TV",
            episodes: 25,
            year: 2013,
            edges: [
              { relationType: "SEQUEL", node: { id: 2, type: "ANIME" } },
              { relationType: "SIDE_STORY", node: { id: 3, type: "ANIME" } },
              { relationType: "ADAPTATION", node: { id: 9, type: "MANGA" } },
            ],
          }),
        ]),
      )
      .mockResolvedValueOnce(
        page([
          franchiseNode({
            id: 2,
            format: "TV",
            episodes: 12,
            year: 2015,
            edges: [
              { relationType: "PREQUEL", node: { id: 1, type: "ANIME" } },
            ],
          }),
          franchiseNode({ id: 3, format: "OVA", episodes: 1, year: 2016 }),
        ]),
      );

    const franchise = await getAnimeFranchise(1);

    expect(graphqlRequestMock).toHaveBeenCalledTimes(2);
    expect(graphqlRequestMock.mock.calls[1][1]).toEqual({ ids: [2, 3] });
    expect(franchise).toEqual({
      rootId: 1,
      seasons: [
        {
          id: 1,
          title: "Season 1",
          romajiTitle: "Season 1",
          format: "TV",
          episodes: 25,
          year: 2013,
        },
        {
          id: 2,
          title: "Season 2",
          romajiTitle: "Season 2",
          format: "TV",
          episodes: 12,
          year: 2015,
        },
        {
          id: 3,
          title: "Season 3",
          romajiTitle: "Season 3",
          format: "OVA",
          episodes: 1,
          year: 2016,
        },
      ],
      totalTvEpisodes: 37,
      tvSeasonCount: 2,
    });
  });

  it("sorts seasons by year with unknown years last", async () => {
    graphqlRequestMock.mockResolvedValueOnce(
      page([franchiseNode({ id: 1, format: "TV", episodes: 12, year: null })]),
    );

    const franchise = await getAnimeFranchise(1);
    expect(franchise.seasons.map((s) => s.id)).toEqual([1]);
    expect(franchise.totalTvEpisodes).toBe(12);
  });
});

describe("getLatestAnime franchise-root filtering", () => {
  it("drops seasons whose prequel or parent is another anime series", async () => {
    const root = makeMedia({ id: 1, type: "ANIME" });
    const laterSeason = makeMedia({
      id: 2,
      type: "ANIME",
      relations: [
        {
          relationType: "PREQUEL",
          node: { id: 1, type: "ANIME", format: "TV" },
        },
      ],
    });
    const childOfUnknownFormat = makeMedia({
      id: 3,
      type: "ANIME",
      relations: [
        {
          relationType: "PARENT",
          node: { id: 1, type: "ANIME", format: null },
        },
      ],
    });
    // A music-video "prequel" is not a real predecessor season.
    const musicPrequel = makeMedia({
      id: 4,
      type: "ANIME",
      relations: [
        {
          relationType: "PREQUEL",
          node: { id: 9, type: "ANIME", format: "MUSIC" },
        },
      ],
    });
    // A manga prequel does not make the anime a non-root.
    const mangaPrequel = makeMedia({
      id: 5,
      type: "ANIME",
      relations: [
        {
          relationType: "PREQUEL",
          node: { id: 8, type: "MANGA", format: "MANGA" },
        },
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

    const latest = await getLatestAnime();
    expect(latest.map((m) => m.id)).toEqual([1, 4, 5]);
  });
});
