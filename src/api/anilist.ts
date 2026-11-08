import { GraphQLClient, gql } from "graphql-request";
import type { SplitFilters } from "@/data/genreFilters";
import type { AniListMedia, AniListMediaDetail, MediaCover } from "@/types";

const client = new GraphQLClient("https://graphql.anilist.co");

// AniList caps a page at 50 entries.
const PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 20;

// One relations shape for every query, so a media record carries the same
// partner facts — counts, title, start year — wherever it came from.
const MEDIA_FIELDS = `
  id
  type
  title { romaji english native }
  coverImage { large color }
  episodes
  chapters
  volumes
  status
  format
  countryOfOrigin
  synonyms
  genres
  startDate { year month day }
  endDate { year month day }
  relations {
    edges {
      relationType(version: 2)
      node {
        id
        type
        format
        episodes
        chapters
        title { romaji english }
        startDate { year }
      }
    }
  }
`;

const PARENT_RELATIONS = new Set(["PREQUEL", "PARENT"]);
const NON_ROOT_BLOCKING_FORMATS = new Set([
  "MANGA",
  "ONE_SHOT",
  "TV",
  "TV_SHORT",
  "MOVIE",
  "OVA",
  "ONA",
  "SPECIAL",
]);

function isFranchiseRoot(media: AniListMedia): boolean {
  return !media.relations.edges.some(
    (e) =>
      PARENT_RELATIONS.has(e.relationType) &&
      e.node.type === media.type &&
      (e.node.format === null || NON_ROOT_BLOCKING_FORMATS.has(e.node.format)),
  );
}

const LATEST_ANIME_QUERY = gql`
  query LatestAnime($page: Int!, $genreNotIn: [String], $tagNotIn: [String]) {
    Page(page: $page, perPage: ${PAGE_SIZE}) {
      pageInfo {
        hasNextPage
      }
      media(
        type: ANIME
        format: TV
        sort: [START_DATE_DESC, POPULARITY_DESC]
        status_in: [RELEASING, FINISHED]
        isAdult: false
        genre_not_in: $genreNotIn
        tag_not_in: $tagNotIn
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const MEDIA_BY_IDS_QUERY = gql`
  query MediaByIds($ids: [Int]!) {
    Page(perPage: ${PAGE_SIZE}) {
      media(id_in: $ids) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

// The search page and the catalog's title matches in one request, so a search
// costs one call against AniList's per-minute rate limit rather than two. The
// catalog page is skipped when there are no ids: an empty `id_in` would not
// filter anything.
const SEARCH_QUERY = gql`
  query Search(
    $query: String!
    $ids: [Int]!
    $hasCatalog: Boolean!
    $genreNotIn: [String]
    $tagNotIn: [String]
  ) {
    search: Page(perPage: ${SEARCH_PAGE_SIZE}) {
      media(
        search: $query
        sort: SEARCH_MATCH
        isAdult: false
        genre_not_in: $genreNotIn
        tag_not_in: $tagNotIn
      ) {
        ${MEDIA_FIELDS}
      }
    }
    catalog: Page(perPage: ${PAGE_SIZE}) @include(if: $hasCatalog) {
      media(
        id_in: $ids
        isAdult: false
        genre_not_in: $genreNotIn
        tag_not_in: $tagNotIn
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const DETAIL_QUERY = gql`
  query Detail($id: Int!) {
    Media(id: $id) {
      ${MEDIA_FIELDS}
      description(asHtml: false)
    }
  }
`;

export type SearchWithCatalog = {
  search: AniListMedia[];
  catalog: AniListMedia[];
};

/**
 * AniList search plus the given catalog media ids, both under the search's
 * genre and tag exclusions, in a single request.
 */
export async function searchWithCatalog({
  query,
  ids,
  filters,
}: {
  query: string;
  ids: readonly number[];
  filters: SplitFilters;
}): Promise<SearchWithCatalog> {
  const data = await client.request<{
    search: { media: AniListMedia[] };
    catalog?: { media: AniListMedia[] };
  }>(SEARCH_QUERY, { query, ids, hasCatalog: ids.length > 0, ...filters });
  return { search: data.search.media, catalog: data.catalog?.media ?? [] };
}

/** One page of the latest-releases feed. */
export type LatestAnimePage = { media: AniListMedia[]; hasNextPage: boolean };

/**
 * Page `page` (1-based) of the newest TV anime, one entry per franchise.
 * Later seasons are dropped, so a page can hold fewer than `PAGE_SIZE`.
 */
export async function getLatestAnime({
  filters,
  page,
}: {
  filters: SplitFilters;
  page: number;
}): Promise<LatestAnimePage> {
  const data = await client.request<{
    Page: { pageInfo: { hasNextPage: boolean }; media: AniListMedia[] };
  }>(LATEST_ANIME_QUERY, { page, ...filters });
  return {
    media: data.Page.media.filter(isFranchiseRoot),
    hasNextPage: data.Page.pageInfo.hasNextPage,
  };
}

export async function getMedia(id: number): Promise<AniListMediaDetail> {
  const data = await client.request<{ Media: AniListMediaDetail }>(
    DETAIL_QUERY,
    { id },
  );
  return data.Media;
}

/**
 * `ids`, de-duplicated and cut into AniList pages, each fetched by `request`
 * one after another: firing a dozen pages at once trips AniList's burst limit,
 * and a rate-limited response comes back without CORS headers, so on web it
 * fails outright rather than retrying.
 */
const inPages = <T>(
  ids: readonly number[],
  request: (page: number[]) => Promise<T[]>,
): Promise<T[]> => {
  const unique = [...new Set(ids)];
  return Array.from({ length: Math.ceil(unique.length / PAGE_SIZE) }, (_, i) =>
    unique.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
  ).reduce<Promise<T[]>>(async (acc, page) => {
    const done = await acc;
    return [...done, ...(await request(page))];
  }, Promise.resolve([]));
};

/** Full media records for any number of ids, batched at AniList's page limit. */
export async function getMediaByIds(
  ids: readonly number[],
): Promise<AniListMedia[]> {
  return inPages(ids, async (page) => {
    const data = await client.request<{ Page: { media: AniListMedia[] } }>(
      MEDIA_BY_IDS_QUERY,
      { ids: page },
    );
    return data.Page.media;
  });
}

const COVERS_BY_IDS_QUERY = gql`
  query CoversByIds($ids: [Int]!) {
    Page(perPage: ${PAGE_SIZE}) {
      media(id_in: $ids) {
        id
        coverImage {
          large
          color
        }
      }
    }
  }
`;

/**
 * Cover art for any number of media ids, batched at AniList's page limit. The
 * result is cached for a week, so this runs about once per device.
 */
export async function getCoversByIds(
  ids: readonly number[],
): Promise<MediaCover[]> {
  return inPages(ids, async (page) => {
    const data = await client.request<{ Page: { media: MediaCover[] } }>(
      COVERS_BY_IDS_QUERY,
      { ids: page },
    );
    return data.Page.media;
  });
}
