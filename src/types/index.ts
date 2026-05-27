export type MediaType = 'ANIME' | 'MANGA';

export interface AniListDate {
  year: number | null;
  month?: number | null;
  day?: number | null;
}

export interface AniListMedia {
  id: number;
  type: MediaType;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    large: string;
    color: string | null;
  };
  description: string | null;
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  status: string | null;
  format: string | null;
  countryOfOrigin: string | null;
  synonyms: string[];
  genres: string[];
  startDate: AniListDate;
  endDate?: AniListDate;
  relations?: { edges: RelationEdge[] };
}

export interface RelationEdge {
  relationType: string;
  node: {
    id: number;
    type: MediaType;
    format?: string | null;
    episodes?: number | null;
    chapters?: number | null;
    title?: { romaji: string; english: string | null };
    startDate?: { year: number | null };
  };
}

export interface MappingEntry {
  episodes: [number, number];
  chapters: [number, number];
  arc?: string;
  season?: number;
  note?: string;
}

export interface SeriesMapping {
  anilistAnimeId: number;
  anilistMangaId: number;
  title: string;
  mappings: MappingEntry[];
  sourceNotes?: string;
}

export type SeriesBadge = 'both' | 'manga-only' | 'anime-only';

export type SeriesEntry = {
  routeId: number;
  primary: AniListMedia;
  anime: AniListMedia | null;
  manga: AniListMedia | null;
  badge: SeriesBadge;
};

export interface MangaDexVolumeCover {
  volume: string;
  locale: string;
  url: string;
  thumbUrl: string;
}

export interface MangaDexTitle {
  locale: string;
  value: string;
}

export interface MangaDexInfo {
  id: string;
  primaryTitle: string;
  titles: MangaDexTitle[];
  volumes: number;
  chapters: number;
  covers: MangaDexVolumeCover[];
}
