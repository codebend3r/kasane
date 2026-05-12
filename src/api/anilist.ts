import { GraphQLClient, gql } from 'graphql-request';
import type { AniListMedia, MediaType } from '../types';

const client = new GraphQLClient('https://graphql.anilist.co');

const SEARCH_QUERY = gql`
  query Search($query: String!, $type: MediaType) {
    Page(perPage: 20) {
      media(search: $query, type: $type, sort: SEARCH_MATCH) {
        id
        type
        title { romaji english native }
        coverImage { large color }
        episodes
        chapters
        volumes
        status
        startDate { year }
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
    }
  }
`;

export async function searchMedia(
  query: string,
  type?: MediaType
): Promise<AniListMedia[]> {
  if (!query.trim()) return [];
  const data = await client.request<{ Page: { media: AniListMedia[] } }>(
    SEARCH_QUERY,
    { query, type: type ?? null }
  );
  return data.Page.media;
}

export async function getMedia(id: number): Promise<AniListMedia> {
  const data = await client.request<{ Media: AniListMedia }>(DETAIL_QUERY, { id });
  return data.Media;
}
