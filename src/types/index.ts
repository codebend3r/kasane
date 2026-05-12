export type MediaType = 'ANIME' | 'MANGA';

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
  startDate: { year: number | null };
}

export interface MappingEntry {
  episodes: [number, number];
  chapters: [number, number];
  arc?: string;
  note?: string;
}

export interface SeriesMapping {
  anilistAnimeId: number;
  anilistMangaId: number;
  title: string;
  mappings: MappingEntry[];
  sourceNotes?: string;
}
