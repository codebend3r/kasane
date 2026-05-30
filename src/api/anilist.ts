import { GraphQLClient, gql } from 'graphql-request';
import type { AniListMedia, MediaType } from '@/types';

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
  format
  countryOfOrigin
  synonyms
  genres
  startDate { year month day }
  endDate { year month day }
  relations {
    edges {
      relationType(version: 2)
      node { id type format }
    }
  }
`;

const PARENT_RELATIONS = new Set(['PREQUEL', 'PARENT']);
const NON_ROOT_BLOCKING_FORMATS = new Set(['MANGA', 'ONE_SHOT', 'TV', 'TV_SHORT', 'MOVIE', 'OVA', 'ONA', 'SPECIAL']);

function isFranchiseRoot(media: AniListMedia): boolean {
  const edges = media.relations?.edges ?? [];
  return !edges.some(
    (e) =>
      PARENT_RELATIONS.has(e.relationType) &&
      e.node.type === media.type &&
      (e.node.format == null || NON_ROOT_BLOCKING_FORMATS.has(e.node.format))
  );
}

const SEARCH_TYPED_QUERY = gql`
  query Search($query: String!, $type: MediaType!, $genreNotIn: [String], $tagNotIn: [String]) {
    Page(perPage: 20) {
      media(
        search: $query
        type: $type
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

const SEARCH_ANY_QUERY = gql`
  query Search($query: String!, $genreNotIn: [String], $tagNotIn: [String]) {
    Page(perPage: 20) {
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
    Page(perPage: 50) {
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
    }
  }
`;

export async function searchMedia(
  query: string,
  type?: MediaType,
  genreNotIn?: string[] | null,
  tagNotIn?: string[] | null
): Promise<AniListMedia[]> {
  if (!query.trim()) return [];
  const data = type
    ? await client.request<{ Page: { media: AniListMedia[] } }>(
        SEARCH_TYPED_QUERY,
        {
          query,
          type,
          genreNotIn: genreNotIn ?? null,
          tagNotIn: tagNotIn ?? null,
        }
      )
    : await client.request<{ Page: { media: AniListMedia[] } }>(
        SEARCH_ANY_QUERY,
        {
          query,
          genreNotIn: genreNotIn ?? null,
          tagNotIn: tagNotIn ?? null,
        }
      );
  return data.Page.media;
}

export async function getLatestAnime(
  genreNotIn?: string[] | null,
  tagNotIn?: string[] | null
): Promise<AniListMedia[]> {
  const data = await client.request<{ Page: { media: AniListMedia[] } }>(
    LATEST_ANIME_QUERY,
    {
      genreNotIn: genreNotIn ?? null,
      tagNotIn: tagNotIn ?? null,
    }
  );
  return data.Page.media.filter(isFranchiseRoot);
}

export async function getMedia(id: number): Promise<AniListMedia> {
  const data = await client.request<{ Media: AniListMedia }>(DETAIL_QUERY, { id });
  return data.Media;
}
