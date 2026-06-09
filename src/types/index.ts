export type MediaType = "ANIME" | "MANGA";

export type PressableState = {
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
};

export type AniListDate = {
  year: number | null;
  month?: number | null;
  day?: number | null;
};

export type AniListMedia = {
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
};

export type RelationEdge = {
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
};

export type MappingEntry = {
  episodes?: [number, number];
  chapters: [number, number];
  arc?: string;
  season?: number;
  note?: string;
};

export type MovieEntry = {
  anilistId?: number;
  title: string;
  year: number;
  chapters?: [number, number];
  afterEpisode?: number;
  note?: string;
};

export type SeriesMapping = {
  anilistAnimeId: number;
  anilistMangaId: number;
  title: string;
  mappings: MappingEntry[];
  movies?: MovieEntry[];
  sourceNotes?: string;
};

export type SeriesBadge = "both" | "manga-only" | "anime-only";

export type SeriesEntry = {
  routeId: number;
  primary: AniListMedia;
  anime: AniListMedia | null;
  manga: AniListMedia | null;
  badge: SeriesBadge;
};

export type MangaDexVolumeCover = {
  volume: string;
  locale: string;
  url: string;
  thumbUrl: string;
};

export type MangaDexTitle = {
  locale: string;
  value: string;
};

export type MangaDexInfo = {
  id: string;
  primaryTitle: string;
  titles: MangaDexTitle[];
  volumes: number;
  chapters: number;
  covers: MangaDexVolumeCover[];
};
