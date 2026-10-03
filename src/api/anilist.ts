import { GraphQLClient, gql } from "graphql-request";
import { englishTitle } from "@/data/format";
import type { SplitFilters } from "@/data/genreFilters";
import type {
  AniListMedia,
  AniListMediaDetail,
  AnimeFranchise,
  FranchiseSeason,
  MediaCover,
  MediaType,
} from "@/types";

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

const SEARCH_QUERY = gql`
  query Search($query: String!, $genreNotIn: [String], $tagNotIn: [String]) {
    Page(perPage: ${SEARCH_PAGE_SIZE}) {
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
  }
`;

const LATEST_ANIME_QUERY = gql`
  query LatestAnime($genreNotIn: [String], $tagNotIn: [String]) {
    Page(perPage: ${PAGE_SIZE}) {
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

const DETAIL_QUERY = gql`
  query Detail($id: Int!) {
    Media(id: $id) {
      ${MEDIA_FIELDS}
      description(asHtml: false)
    }
  }
`;

/** AniList search, with the hidden genres and tags excluded server-side. */
export async function searchMedia({
  query,
  filters,
}: {
  query: string;
  filters: SplitFilters;
}): Promise<AniListMedia[]> {
  if (!query.trim()) return [];
  const data = await client.request<{ Page: { media: AniListMedia[] } }>(
    SEARCH_QUERY,
    { query, ...filters },
  );
  return data.Page.media;
}

export async function getLatestAnime(
  filters: SplitFilters,
): Promise<AniListMedia[]> {
  const data = await client.request<{ Page: { media: AniListMedia[] } }>(
    LATEST_ANIME_QUERY,
    { ...filters },
  );
  return data.Page.media.filter(isFranchiseRoot);
}

export async function getMedia(id: number): Promise<AniListMediaDetail> {
  const data = await client.request<{ Media: AniListMediaDetail }>(
    DETAIL_QUERY,
    { id },
  );
  return data.Media;
}

export async function getMediaByIds(ids: number[]): Promise<AniListMedia[]> {
  if (ids.length === 0) return [];
  const data = await client.request<{ Page: { media: AniListMedia[] } }>(
    MEDIA_BY_IDS_QUERY,
    { ids },
  );
  return data.Page.media;
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
 * Cover art for an arbitrary number of media ids, batched at AniList's page
 * limit. The batches run one after another: firing all dozen of the catalog's
 * pages at once trips AniList's burst limit, and a rate-limited response comes
 * back without CORS headers, so on web it fails outright rather than retrying.
 * The result is cached for a week, so this runs about once per device.
 */
export async function getCoversByIds(
  ids: readonly number[],
): Promise<MediaCover[]> {
  const unique = [...new Set(ids)];
  return Array.from({ length: Math.ceil(unique.length / PAGE_SIZE) }, (_, i) =>
    unique.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
  ).reduce<Promise<MediaCover[]>>(async (acc, batch) => {
    const covers = await acc;
    const page = await client.request<{ Page: { media: MediaCover[] } }>(
      COVERS_BY_IDS_QUERY,
      { ids: batch },
    );
    return [...covers, ...page.Page.media];
  }, Promise.resolve([]));
}

const FRANCHISE_NODE_QUERY = gql`
  query FranchiseNode($ids: [Int]) {
    Page(perPage: ${PAGE_SIZE}) {
      media(id_in: $ids, type: ANIME) {
        id
        title {
          romaji
          english
        }
        format
        episodes
        startDate {
          year
        }
        relations {
          edges {
            relationType(version: 2)
            node {
              id
              type
            }
          }
        }
      }
    }
  }
`;

export type FranchiseRawNode = {
  id: number;
  title: { romaji: string; english: string | null };
  format: string | null;
  episodes: number | null;
  startDate: { year: number | null };
  relations: {
    edges: { relationType: string; node: { id: number; type: MediaType } }[];
  };
};

const FRANCHISE_RELATIONS = new Set([
  "SEQUEL",
  "PREQUEL",
  "PARENT",
  "SIDE_STORY",
]);

async function collectFranchiseNodes(
  frontier: number[],
  visited: Map<number, FranchiseRawNode>,
): Promise<FranchiseRawNode[]> {
  const ids = frontier.filter((id) => !visited.has(id));
  if (ids.length === 0) return Array.from(visited.values());

  const data = await client.request<{ Page: { media: FranchiseRawNode[] } }>(
    FRANCHISE_NODE_QUERY,
    { ids },
  );
  const nextVisited = data.Page.media.reduce(
    (acc, node) => acc.set(node.id, node),
    new Map(visited),
  );
  const next = data.Page.media.flatMap((node) =>
    node.relations.edges
      .filter(
        (edge) =>
          FRANCHISE_RELATIONS.has(edge.relationType) &&
          edge.node.type === "ANIME" &&
          !nextVisited.has(edge.node.id),
      )
      .map((edge) => edge.node.id),
  );
  return collectFranchiseNodes([...new Set(next)], nextVisited);
}

export async function getAnimeFranchise(
  rootId: number,
): Promise<AnimeFranchise> {
  const nodes = await collectFranchiseNodes([rootId], new Map());

  const seasons: FranchiseSeason[] = nodes
    .map((n) => ({
      id: n.id,
      title: englishTitle(n.title),
      romajiTitle: n.title.romaji,
      format: n.format,
      episodes: n.episodes,
      year: n.startDate.year,
    }))
    .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));

  const tvSeasons = seasons.filter((s) => s.format === "TV");
  const totalTvEpisodes = tvSeasons.reduce(
    (sum, s) => sum + (s.episodes ?? 0),
    0,
  );

  return {
    rootId,
    seasons,
    totalTvEpisodes,
    tvSeasonCount: tvSeasons.length,
  };
}

export function hasAnimeSequels(media: AniListMedia): boolean {
  if (media.type !== "ANIME") return false;
  return media.relations.edges.some(
    (e) => e.relationType === "SEQUEL" && e.node.type === "ANIME",
  );
}
