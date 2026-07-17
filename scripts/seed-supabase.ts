/**
 * One-time seeder: loads the static mapping JSON files into Supabase.
 *
 * The mapping data is spread across ~580 files in `src/data/mappings/`, wired
 * together (in a specific order) by the `ALL_MAPPINGS` array in
 * `src/data/index.ts`. That order matters: `findMappingByMediaId` returns the
 * first match, so when two series share a manga id the earlier one wins. We
 * insert `series` in the same order so identity ids increment accordingly, and
 * the client fetches ordered by id to preserve the tie-break.
 *
 * Catalog tables are read-only under RLS, so this must run while a temporary
 * insert grant/policy is in place (see the surrounding seed steps). It talks to
 * PostgREST with the publishable key — no service key or raw SQL needed.
 *
 * Run: `bun run scripts/seed-supabase.ts`
 */
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

type RawEntry = {
  episodes?: number[];
  chapters: number[];
  arc?: string;
  season?: number;
  note?: string;
};
type RawMovie = {
  anilistId?: number;
  title: string;
  year: number;
  chapters?: number[];
  afterEpisode?: number;
  note?: string;
};
type RawMapping = {
  anilistAnimeId: number;
  anilistMangaId: number;
  title: string;
  sourceNotes?: string;
  mappings: RawEntry[];
  movies?: RawMovie[];
};

const SUPABASE_URL = "https://obtgldkascmxbtpnvscn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4z9kuzXtE3PeVgbPDtQUWw_cSrKxsu-";

const ROOT = path.resolve(__dirname, "..");
const MAPPINGS_DIR = path.join(ROOT, "src/data/mappings");

/** Ordered list of mapping files, matching the `ALL_MAPPINGS` array order. */
const orderedMappingFiles = (): string[] => {
  const indexSrc = fs.readFileSync(
    path.join(ROOT, "src/data/index.ts"),
    "utf8",
  );

  const importRe =
    /import\s+(\w+)\s+from\s+"@\/data\/mappings\/([^"]+)\.json";/g;
  const varToFile = new Map(
    [...indexSrc.matchAll(importRe)].map((m): [string, string] => [
      m[1],
      `${m[2]}.json`,
    ]),
  );

  const start = indexSrc.indexOf("const ALL_MAPPINGS: SeriesMapping[] = [");
  const arrOpen = indexSrc.indexOf("= [", start) + 2;
  const end = indexSrc.indexOf("].map(normalizeMapping);", arrOpen);

  return indexSrc
    .slice(arrOpen + 1, end)
    .split(",")
    .map((s) => s.trim())
    .filter((s) => varToFile.has(s))
    .map((s) => {
      const file = varToFile.get(s);
      if (!file) throw new Error(`no file for ${s}`);
      return file;
    });
};

const chunk = <T>(arr: T[], size: number): T[][] =>
  arr.reduce<T[][]>((acc, item, i) => {
    if (i % size === 0) acc.push([]);
    acc[acc.length - 1].push(item);
    return acc;
  }, []);

const seed = async (): Promise<void> => {
  const files = orderedMappingFiles();
  const onDisk = fs
    .readdirSync(MAPPINGS_DIR)
    .filter((f) => f.endsWith(".json"));
  if (files.length !== onDisk.length) {
    throw new Error(
      `ALL_MAPPINGS lists ${files.length} files but ${onDisk.length} exist on disk`,
    );
  }

  const mappings: RawMapping[] = files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(MAPPINGS_DIR, f), "utf8")),
  );

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });

  // series — inserted in ALL_MAPPINGS order so identity ids increment in order.
  const seriesToId = new Map<number, number>();
  await chunk(mappings, 200).reduce(
    (prev, batch) =>
      prev.then(async () => {
        const { data, error } = await supabase
          .from("series")
          .insert(
            batch.map((m) => ({
              anilist_anime_id: m.anilistAnimeId,
              anilist_manga_id: m.anilistMangaId,
              title: m.title,
              source_notes: m.sourceNotes ?? null,
            })),
          )
          .select("id, anilist_anime_id");
        if (error) throw new Error(`series insert failed: ${error.message}`);
        (data ?? []).forEach((row) =>
          seriesToId.set(row.anilist_anime_id, row.id),
        );
      }),
    Promise.resolve(),
  );
  console.log(`inserted ${seriesToId.size} series`);

  const idFor = (animeId: number): number => {
    const id = seriesToId.get(animeId);
    if (id === undefined) throw new Error(`no series id for anime ${animeId}`);
    return id;
  };

  // arc_mappings
  const arcRows = mappings.flatMap((m) =>
    m.mappings.map((e, i) => {
      const [es, ee] = e.episodes ?? [null, null];
      return {
        series_id: idFor(m.anilistAnimeId),
        position: i,
        episode_start: es,
        episode_end: ee,
        chapter_start: e.chapters[0],
        chapter_end: e.chapters[1],
        arc: e.arc ?? null,
        season: e.season ?? null,
        note: e.note ?? null,
      };
    }),
  );
  await chunk(arcRows, 500).reduce(
    (prev, batch) =>
      prev.then(async () => {
        const { error } = await supabase.from("arc_mappings").insert(batch);
        if (error) throw new Error(`arc insert failed: ${error.message}`);
      }),
    Promise.resolve(),
  );
  console.log(`inserted ${arcRows.length} arc mappings`);

  // movies
  const movieRows = mappings.flatMap((m) =>
    (m.movies ?? []).map((mv, i) => {
      const [cs, ce] = mv.chapters ?? [null, null];
      return {
        series_id: idFor(m.anilistAnimeId),
        position: i,
        anilist_id: mv.anilistId ?? null,
        title: mv.title,
        year: mv.year,
        chapter_start: cs,
        chapter_end: ce,
        after_episode: mv.afterEpisode ?? null,
        note: mv.note ?? null,
      };
    }),
  );
  await chunk(movieRows, 500).reduce(
    (prev, batch) =>
      prev.then(async () => {
        const { error } = await supabase.from("movies").insert(batch);
        if (error) throw new Error(`movie insert failed: ${error.message}`);
      }),
    Promise.resolve(),
  );
  console.log(`inserted ${movieRows.length} movies`);
};

seed().then(
  () => console.log("seed complete"),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
