import type { AniListMedia, MediaType, RelationEdge } from "@/types";

// Minimal `AniListMedia` builder shared by the tests that exercise pairing,
// synthetic mappings and franchise-root filtering. Everything the callers do
// not care about is nulled out, so a test names only the fields it asserts on.
export const makeMedia = ({
  id,
  type,
  title,
  episodes = null,
  chapters = null,
  startYear = null,
  relations,
}: {
  id: number;
  type: MediaType;
  title?: string;
  episodes?: number | null;
  chapters?: number | null;
  startYear?: number | null;
  relations?: RelationEdge[];
}): AniListMedia => ({
  id,
  type,
  title: { romaji: title ?? `Media ${id}`, english: null, native: null },
  coverImage: { large: "https://img.example/cover.png", color: null },
  episodes,
  chapters,
  volumes: null,
  status: null,
  format: null,
  countryOfOrigin: null,
  synonyms: [],
  genres: [],
  startDate: { year: startYear },
  endDate: { year: null },
  relations: { edges: relations ?? [] },
});

/** One relation edge with every node field present, nulled unless given. */
export const makeEdge = ({
  relationType,
  id,
  type,
  format = null,
  episodes = null,
  chapters = null,
  startYear = null,
}: {
  relationType: string;
  id: number;
  type: MediaType;
  format?: string | null;
  episodes?: number | null;
  chapters?: number | null;
  startYear?: number | null;
}): RelationEdge => ({
  relationType,
  node: {
    id,
    type,
    format,
    episodes,
    chapters,
    title: { romaji: `Media ${id}`, english: null },
    startDate: { year: startYear },
  },
});
