import { fromMock, tableOf } from "@test/mocks/supabase";
import type { SeriesMapping } from "@/types";
import type { SeriesRow } from "@/types/catalog";
import type { Database } from "@/types/supabase";

type GenreRow = Database["public"]["Tables"]["genre_filters"]["Row"];

// One catalog series as Supabase returns it. Rows arrive with `position` out
// of order on purpose: the transform must sort.
export const seriesRow: SeriesRow = {
  id: 1,
  anilist_anime_id: 16498,
  anilist_manga_id: 53390,
  title: "Attack on Titan",
  source_notes: "hand-mapped",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  arc_mappings: [
    {
      id: 11,
      series_id: 1,
      position: 2,
      chapter_start: 9,
      chapter_end: 34,
      episode_start: null,
      episode_end: null,
      arc: "Unadapted tail",
      season: null,
      note: "manga only",
    },
    {
      id: 10,
      series_id: 1,
      position: 1,
      chapter_start: 1,
      chapter_end: 8,
      episode_start: 1,
      episode_end: 2,
      arc: "Fall of Shiganshina",
      season: 1,
      note: null,
    },
  ],
  movies: [
    {
      id: 20,
      series_id: 1,
      position: 1,
      anilist_id: 2028,
      title: "Guren no Yumiya",
      year: 2014,
      chapter_start: 1,
      chapter_end: 33,
      after_episode: 13,
      note: null,
    },
  ],
};

/** `seriesRow` after the row → `SeriesMapping` transform. */
export const seriesMapping: SeriesMapping = {
  anilistAnimeId: 16498,
  anilistMangaId: 53390,
  title: "Attack on Titan",
  sourceNotes: "hand-mapped",
  mappings: [
    {
      chapters: [1, 8],
      episodes: [1, 2],
      arc: "Fall of Shiganshina",
      season: 1,
      note: undefined,
    },
    {
      chapters: [9, 34],
      episodes: undefined,
      arc: "Unadapted tail",
      season: undefined,
      note: "manga only",
    },
  ],
  movies: [
    {
      anilistId: 2028,
      title: "Guren no Yumiya",
      year: 2014,
      chapters: [1, 33],
      afterEpisode: 13,
      note: undefined,
    },
  ],
};

export const genreRows: GenreRow[] = [
  {
    id: "hentai",
    kind: "genre",
    label: "Hentai",
    sort_order: 1,
    token: "Hentai",
  },
  { id: "ecchi", kind: "tag", label: "Ecchi", sort_order: 2, token: "Ecchi" },
  // Unknown kinds from the DB must degrade to "genre", never crash a filter.
  {
    id: "odd",
    kind: "mystery-kind",
    label: "Odd",
    sort_order: 3,
    token: "Odd",
  },
];

/** Serves the catalog tables from fixtures through `fromMock`. */
export const serveCatalog = ({
  aliases = [],
}: {
  aliases?: { alias: string; target: string }[];
}): void => {
  const tables: Record<string, unknown[]> = {
    series: [seriesRow],
    search_aliases: aliases,
    genre_filters: genreRows,
  };
  fromMock.mockImplementation((table) => {
    const rows = tables[table];
    // Fail loudly on a renamed table rather than reading it as empty or as the
    // wrong fixture.
    if (!rows) throw new Error(`no fixture for supabase table "${table}"`);
    return tableOf(rows);
  });
};
