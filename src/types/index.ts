export type MediaType = "ANIME" | "MANGA";

/** The two sides of a series a reader tracks progress on. */
export type ProgressSide = "anime" | "manga";

/** A position on one side, such as "chapter 80" or "episode 24". */
export type SidePosition = { side: ProgressSide; position: number };

/** The pointer fields react-native-web puts on a forwarded mouse event. */
export type MouseLike = { nativeEvent: { clientX: number; clientY: number } };

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
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  status: string | null;
  format: string | null;
  countryOfOrigin: string | null;
  synonyms: string[];
  genres: string[];
  startDate: AniListDate;
  endDate: AniListDate;
  relations: { edges: RelationEdge[] };
};

/** A media record from the detail query, which also carries the synopsis. */
export type AniListMediaDetail = AniListMedia & { description: string | null };

/** Just enough of a media record to render its poster. */
export type MediaCover = {
  id: number;
  coverImage: {
    large: string;
    color: string | null;
  };
};

export type RelationEdge = {
  relationType: string;
  node: {
    id: number;
    type: MediaType;
    format: string | null;
    episodes: number | null;
    chapters: number | null;
    title: { romaji: string; english: string | null };
    startDate: { year: number | null };
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

/**
 * The mapping a series screen shows, and where it came from: hand-curated in
 * the catalog, or estimated linearly from AniList's episode and chapter counts.
 */
export type ResolvedMapping = {
  source: "curated" | "estimated";
  mapping: SeriesMapping;
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

export type FranchiseSeason = {
  id: number;
  title: string;
  romajiTitle: string;
  format: string | null;
  episodes: number | null;
  year: number | null;
};

export type AnimeFranchise = {
  rootId: number;
  seasons: FranchiseSeason[];
  totalTvEpisodes: number;
  tvSeasonCount: number;
};

export type MangaDexInfo = {
  id: string;
  primaryTitle: string;
  titles: MangaDexTitle[];
  volumes: number;
  chapters: number;
  covers: MangaDexVolumeCover[];
};
