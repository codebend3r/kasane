import { GraphQLClient, gql } from 'graphql-request';
import type { AniListMedia, MediaType } from '../types';

const client = new GraphQLClient('https://graphql.anilist.co');

const MEDIA_FIELDS = `
  id
  type
  title { romaji english native }
  coverImage { large color }
  episodes
  chapters
  volumes
  status
  startDate { year }
  relations {
    edges {
      relationType(version: 2)
      node { id type }
    }
  }
`;

const PARENT_RELATIONS = new Set(['PREQUEL', 'PARENT', 'SPIN_OFF', 'SIDE_STORY']);

function isFranchiseRoot(media: AniListMedia): boolean {
  const edges = media.relations?.edges ?? [];
  return !edges.some(
    (e) => PARENT_RELATIONS.has(e.relationType) && e.node.type === media.type
  );
}

const SEARCH_TYPED_QUERY = gql`
  query Search($query: String!, $type: MediaType!) {
    Page(perPage: 20) {
      media(search: $query, type: $type, sort: SEARCH_MATCH) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const SEARCH_ANY_QUERY = gql`
  query Search($query: String!) {
    Page(perPage: 20) {
      media(search: $query, sort: SEARCH_MATCH) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const LATEST_ANIME_QUERY = gql`
  query LatestAnime {
    Page(perPage: 24) {
      media(
        type: ANIME
        format: TV
        sort: [START_DATE_DESC, POPULARITY_DESC]
        status_in: [RELEASING, FINISHED]
        isAdult: false
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const DETAIL_QUERY = gql`
  query Detail($id: Int!) {
    Media(id: $id) {
      id
      type
      title { romaji english native }
      coverImage { large color }
      description(asHtml: false)
      episodes
      chapters
      volumes
      status
      startDate { year }
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
    }
  }
`;

export async function searchMedia(
  query: string,
  type?: MediaType
): Promise<AniListMedia[]> {
  if (!query.trim()) return [];
  const data = type
    ? await client.request<{ Page: { media: AniListMedia[] } }>(
        SEARCH_TYPED_QUERY,
        { query, type }
      )
    : await client.request<{ Page: { media: AniListMedia[] } }>(
        SEARCH_ANY_QUERY,
        { query }
      );
  return data.Page.media.filter(isFranchiseRoot);
}

export async function getLatestAnime(): Promise<AniListMedia[]> {
  const data = await client.request<{ Page: { media: AniListMedia[] } }>(
    LATEST_ANIME_QUERY
  );
  return data.Page.media;
}

export async function getMedia(id: number): Promise<AniListMedia> {
  const data = await client.request<{ Media: AniListMedia }>(DETAIL_QUERY, { id });
  return data.Media;
}
