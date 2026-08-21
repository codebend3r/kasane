// `@/data/catalog` pulls in the Supabase client, which the bun test preload in
// `test/setup.ts` replaces with the mocks from `@test/mocks/supabase`. The hook
// tests below feed fixture rows through `fromMock` to exercise the row →
// `SeriesMapping` transformation end to end.
import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  indexByMediaId,
  useCatalog,
  useGenreFilters,
  useHydrateSearchAliases,
  useMapping,
} from "@/data/catalog";
import { fromMock, tableOf } from "@test/mocks/supabase";
import { applySearchAlias, setSearchAliases } from "@/data/searchAliases";
import type { SeriesMapping } from "@/types";
import type { Database } from "@/types/supabase";

const aot: SeriesMapping = {
  anilistAnimeId: 16498,
  anilistMangaId: 53390,
  title: "Attack on Titan",
  mappings: [
    { chapters: [1, 8], episodes: [1, 2], arc: "Fall of Shiganshina" },
  ],
};

const onePiece: SeriesMapping = {
  anilistAnimeId: 21,
  anilistMangaId: 30013,
  title: "One Piece",
  mappings: [{ chapters: [1, 7], episodes: [1, 3], arc: "Romance Dawn" }],
};

describe("indexByMediaId", () => {
  it("resolves a series by its anime id and by its manga id", () => {
    const index = indexByMediaId([aot, onePiece]);
    expect(index.get(16498)?.title).toBe("Attack on Titan");
    expect(index.get(53390)?.title).toBe("Attack on Titan");
    expect(index.get(21)?.title).toBe("One Piece");
    expect(index.get(999999)).toBeUndefined();
  });

  it("keeps the first-listed series when two share a media id", () => {
    const shared: SeriesMapping = { ...onePiece, anilistMangaId: 53390 };
    const index = indexByMediaId([aot, shared]);
    expect(index.get(53390)?.title).toBe("Attack on Titan");
  });

  it("reuses the index for the same array instance", () => {
    const mappings = [aot, onePiece];
    expect(indexByMediaId(mappings)).toBe(indexByMediaId(mappings));
  });

  // Regression guard. The catalog query is persisted to AsyncStorage as JSON,
  // and a `Map` does not survive that round trip — it serializes to `{}`. When
  // the index was stored on the query payload, every cold launch restored it as
  // a plain object and `byMediaId.get(...)` threw, taking down the series
  // screen. Deriving the index from `mappings` keeps it a real Map.
  it("still resolves after the JSON round trip the query cache performs", () => {
    const persisted = JSON.parse(JSON.stringify({ mappings: [aot, onePiece] }));
    const index = indexByMediaId(persisted.mappings);
    expect(index).toBeInstanceOf(Map);
    expect(index.get(16498)?.title).toBe("Attack on Titan");
    expect(index.get(53390)?.title).toBe("Attack on Titan");
  });
});

type ArcRow = Database["public"]["Tables"]["arc_mappings"]["Row"];
type MovieRow = Database["public"]["Tables"]["movies"]["Row"];
type GenreRow = Database["public"]["Tables"]["genre_filters"]["Row"];
type SeriesRow = Database["public"]["Tables"]["series"]["Row"] & {
  arc_mappings: ArcRow[];
  movies: MovieRow[];
};

// Rows arrive with `position` out of order on purpose: the transform must sort.
const seriesRow: SeriesRow = {
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

const genreRows: GenreRow[] = [
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

const catalogTables = ({ aliases = [] }: { aliases?: unknown[] }) => {
  fromMock.mockImplementation((table) => {
    if (table === "series") return tableOf([seriesRow]);
    if (table === "search_aliases") return tableOf(aliases);
    return tableOf(genreRows);
  });
};

// Renders `hook` inside a fresh QueryClient, capturing every emitted value.
const renderHook = <T>(hook: () => T) => {
  const captures: T[] = [];
  const Probe = () => {
    captures.push(hook());
    return null;
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  let root: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    root = TestRenderer.create(
      React.createElement(
        QueryClientProvider,
        { client },
        React.createElement(Probe),
      ),
    );
  });
  return {
    captures,
    unmount: () => {
      act(() => {
        root?.unmount();
      });
    },
  };
};

// Ticks the event loop inside act() until `done` reports settled. A macrotask
// is required, not just a microtask flush: react-query settles the second and
// later query instances in this file through a timer.
const settle = async (done: () => boolean): Promise<void> => {
  const attempt = async (remaining: number): Promise<void> => {
    if (done() || remaining === 0) return;
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    });
    return attempt(remaining - 1);
  };
  return attempt(20);
};

const last = <T>(values: T[]): T => values[values.length - 1];

const expectedMapping: SeriesMapping = {
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

describe("useCatalog", () => {
  afterEach(() => {
    fromMock.mockClear();
  });

  it("transforms series rows into arc-sorted mappings and resolves both ids", async () => {
    catalogTables({});
    const { captures, unmount } = renderHook(useCatalog);
    try {
      expect(captures[0].isLoaded).toBe(false);
      expect(captures[0].findMapping(16498)).toBeNull();

      await settle(() => last(captures).isLoaded);

      const catalog = last(captures);
      expect(catalog.mappings).toEqual([expectedMapping]);
      expect(catalog.findMapping(16498)).toEqual(expectedMapping);
      expect(catalog.findMapping(53390)).toEqual(expectedMapping);
      expect(catalog.findMapping(999999)).toBeNull();
    } finally {
      unmount();
    }
  });
});

describe("useMapping", () => {
  afterEach(() => {
    fromMock.mockClear();
  });

  it("is null before the catalog loads, then resolves by media id", async () => {
    catalogTables({});
    const { captures, unmount } = renderHook(() => useMapping(53390));
    try {
      expect(captures[0]).toBeNull();
      await settle(() => last(captures) !== null);
      expect(last(captures)).toEqual(expectedMapping);
    } finally {
      unmount();
    }
  });
});

describe("useGenreFilters", () => {
  afterEach(() => {
    fromMock.mockClear();
  });

  it("keeps known kinds and degrades unknown kinds to genre", async () => {
    catalogTables({});
    const { captures, unmount } = renderHook(useGenreFilters);
    try {
      await settle(() => last(captures).length > 0);
      expect(last(captures)).toEqual([
        { id: "hentai", kind: "genre", label: "Hentai", token: "Hentai" },
        { id: "ecchi", kind: "tag", label: "Ecchi", token: "Ecchi" },
        { id: "odd", kind: "genre", label: "Odd", token: "Odd" },
      ]);
    } finally {
      unmount();
    }
  });
});

describe("useHydrateSearchAliases", () => {
  afterEach(() => {
    fromMock.mockClear();
    setSearchAliases({});
  });

  it("pushes DB aliases into the search-alias singleton", async () => {
    catalogTables({
      aliases: [{ alias: "aot", target: "Attack on Titan" }],
    });
    const { unmount } = renderHook(useHydrateSearchAliases);
    try {
      await settle(() => applySearchAlias("aot") !== "aot");
      expect(applySearchAlias(" A.O.T! ")).toBe("Attack on Titan");
    } finally {
      unmount();
    }
  });
});
