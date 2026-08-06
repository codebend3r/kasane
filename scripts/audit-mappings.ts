/**
 * Catalog integrity audit.
 *
 * Arc mappings are hand-researched and written straight into Supabase, so they
 * never pass through code review. This script is the safety net: it reads every
 * `series` + `arc_mappings` + `movies` row through the publishable key (the
 * catalog is public-read under RLS) and reports structural problems.
 *
 * Findings triaged as intentional (light-novel volume ranges that genuinely
 * overlap, anime-original arcs sharing a boundary chapter, deliberately partial
 * mappings of very long shows) are silenced via `scripts/audit-ignore.json` so
 * the report stays small enough that a new regression is actually visible.
 *
 * Run:
 *   bun run scripts/audit-mappings.ts                  # structural checks only
 *   bun run scripts/audit-mappings.ts --anilist        # + AniList count cross-check
 *   bun run scripts/audit-mappings.ts --series "One Piece"
 *   bun run scripts/audit-mappings.ts --json           # machine-readable
 *   bun run scripts/audit-mappings.ts --errors-only
 *   bun run scripts/audit-mappings.ts --no-ignore      # include triaged findings
 */
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://obtgldkascmxbtpnvscn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4z9kuzXtE3PeVgbPDtQUWw_cSrKxsu-";

const ANILIST_URL = "https://graphql.anilist.co";
const ANILIST_PAGE_SIZE = 50;
const ANILIST_PAUSE_MS = 1200;
const POSTGREST_PAGE = 1000;

type ArcRow = {
  position: number;
  episode_start: number | null;
  episode_end: number | null;
  chapter_start: number;
  chapter_end: number;
  arc: string | null;
  season: number | null;
  note: string | null;
};

type MovieRow = {
  position: number;
  anilist_id: number | null;
  title: string;
  year: number;
  chapter_start: number | null;
  chapter_end: number | null;
  after_episode: number | null;
  note: string | null;
};

type SeriesRow = {
  id: number;
  anilist_anime_id: number;
  anilist_manga_id: number;
  title: string;
  source_notes: string | null;
  arc_mappings: ArcRow[];
  movies: MovieRow[];
};

type Severity = "error" | "warn" | "info";

type Finding = {
  severity: Severity;
  code: string;
  series: string;
  seriesId: number;
  message: string;
};

type AniListCounts = {
  id: number;
  episodes: number | null;
  chapters: number | null;
  status: string | null;
};

const finding = (
  severity: Severity,
  code: string,
  series: SeriesRow,
  message: string,
): Finding => ({
  severity,
  code,
  series: series.title,
  seriesId: series.id,
  message,
});

const byPosition = <T extends { position: number }>(rows: readonly T[]): T[] =>
  [...rows].sort((a, b) => a.position - b.position);

const SEVERITY_RANK: Record<Severity, number> = { error: 0, warn: 1, info: 2 };

/**
 * Unmapped runs are ambiguous: a 1-3 unit hole is almost always an off-by-one in
 * a hand-typed boundary, while a long run is anime filler or a deliberately
 * skipped stretch. Grading by size keeps the typos visible instead of burying
 * them under the ~90 legitimate filler gaps in shows like Bleach and Gintama.
 */
const TYPO_GAP_MAX = 3;
const gapSeverity = (size: number): Severity =>
  size <= TYPO_GAP_MAX ? "warn" : "info";

/** Positions must form a dense 0-based sequence; the UI renders in that order. */
const checkPositions = (
  series: SeriesRow,
  rows: readonly { position: number }[],
  label: string,
): Finding[] => {
  const positions = rows.map((r) => r.position).sort((a, b) => a - b);
  const expected = positions.map((_, i) => i);
  return positions.join(",") === expected.join(",")
    ? []
    : [
        finding(
          "error",
          "position-sequence",
          series,
          `${label} positions are [${positions.join(", ")}], expected [${expected.join(", ")}]`,
        ),
      ];
};

const checkArcRanges = (
  series: SeriesRow,
  arcs: readonly ArcRow[],
): Finding[] =>
  arcs.flatMap((a) => {
    const name = a.arc ?? `position ${a.position}`;
    const chapterOrder =
      a.chapter_start > a.chapter_end
        ? [
            finding(
              "error",
              "chapter-range-inverted",
              series,
              `"${name}" has chapters ${a.chapter_start}-${a.chapter_end} (start after end)`,
            ),
          ]
        : [];
    const episodeOrder =
      a.episode_start !== null &&
      a.episode_end !== null &&
      a.episode_start > a.episode_end
        ? [
            finding(
              "error",
              "episode-range-inverted",
              series,
              `"${name}" has episodes ${a.episode_start}-${a.episode_end} (start after end)`,
            ),
          ]
        : [];
    // Chapter 0 is legitimate: publishers number prologue chapters "00" (Black
    // Lagoon's first chapter is officially 00). Only a negative index is wrong.
    const negativeChapter =
      a.chapter_start < 0
        ? [
            finding(
              "error",
              "negative-chapter",
              series,
              `"${name}" starts at chapter ${a.chapter_start}`,
            ),
          ]
        : [];
    const nonPositiveEpisode =
      a.episode_start !== null && a.episode_start < 1
        ? [
            finding(
              "error",
              "non-positive-episode",
              series,
              `"${name}" starts at episode ${a.episode_start}; episodes are 1-indexed`,
            ),
          ]
        : [];
    return [
      ...chapterOrder,
      ...episodeOrder,
      ...negativeChapter,
      ...nonPositiveEpisode,
    ];
  });

/** Consecutive arcs should tile the chapter axis with no gap and no overlap. */
const checkChapterContinuity = (
  series: SeriesRow,
  arcs: readonly ArcRow[],
): Finding[] =>
  arcs.slice(1).flatMap((cur, i) => {
    const prev = arcs[i];
    const name = cur.arc ?? `position ${cur.position}`;
    const prevName = prev.arc ?? `position ${prev.position}`;

    // `chapter_start`/`chapter_end` are NOT NULL, so an anime-original arc that
    // adapts no manga at all can only say so by collapsing to a zero-width range
    // pinned at the last adapted chapter. Dororo, Ouran, Railgun and My Isekai
    // Life all use this idiom; it is the schema's only way to express it.
    if (
      cur.chapter_start === cur.chapter_end &&
      cur.chapter_start === prev.chapter_end
    ) {
      return [
        finding(
          "info",
          "anime-original-pinned",
          series,
          `"${name}" is pinned to chapter ${cur.chapter_start} with no width, marking an arc that adapts no further manga`,
        ),
      ];
    }

    if (cur.chapter_start <= prev.chapter_end) {
      // One shared unit is ambiguous: adaptations routinely split a single
      // chapter across an arc boundary, and a hand-typed boundary is just as
      // routinely off by one. Only a wider overlap is unambiguously wrong.
      const shared = prev.chapter_end - cur.chapter_start + 1;
      return [
        finding(
          shared === 1 ? "warn" : "error",
          "chapter-overlap",
          series,
          `"${name}" starts at chapter ${cur.chapter_start} but "${prevName}" runs through ${prev.chapter_end}` +
            (shared === 1
              ? " (1 shared chapter: a split boundary, or an off-by-one)"
              : ` (${shared} shared chapters)`),
        ),
      ];
    }
    const size = cur.chapter_start - prev.chapter_end - 1;
    return size > 0
      ? [
          finding(
            gapSeverity(size),
            "chapter-gap",
            series,
            `chapters ${prev.chapter_end + 1}-${cur.chapter_start - 1} belong to no arc (between "${prevName}" and "${name}")`,
          ),
        ]
      : [];
  });

/**
 * Episodes are cumulative across seasons, so they must strictly ascend. Arcs
 * without episodes are unadapted and may only appear as a trailing block.
 */
const checkEpisodeContinuity = (
  series: SeriesRow,
  arcs: readonly ArcRow[],
): Finding[] => {
  const adapted = arcs.filter(
    (a) => a.episode_start !== null && a.episode_end !== null,
  );
  const firstNullIndex = arcs.findIndex((a) => a.episode_start === null);
  // An unadapted arc between two adapted ones is a real and common shape: the
  // anime skipped that source material and resumed after it (Banished from the
  // Hero's Party skips LN volumes 6-7; My Stepmom's Daughter skips volume 3).
  // It is worth surfacing, because it is also what a mis-ordered row looks like.
  const sandwiched =
    firstNullIndex >= 0 &&
    arcs.slice(firstNullIndex).some((a) => a.episode_start !== null)
      ? [
          finding(
            "warn",
            "episode-null-sandwich",
            series,
            `the arc at position ${firstNullIndex} has no episodes but adapted arcs follow it; confirm the anime skipped this material rather than the row being misordered`,
          ),
        ]
      : [];

  const flow = adapted.slice(1).flatMap((cur, i) => {
    const prev = adapted[i];
    const name = cur.arc ?? `position ${cur.position}`;
    const prevName = prev.arc ?? `position ${prev.position}`;
    const start = cur.episode_start ?? 0;
    const prevEnd = prev.episode_end ?? 0;
    if (start <= prevEnd) {
      // Same ambiguity as chapters: one episode routinely straddles an arc
      // boundary (Aoashi's own wiki lists episode 17 under both arcs), so a
      // single shared episode is a prompt to check, not a proven error.
      const shared = prevEnd - start + 1;
      return [
        finding(
          shared === 1 ? "warn" : "error",
          "episode-overlap",
          series,
          `"${name}" starts at episode ${start} but "${prevName}" runs through ${prevEnd}` +
            (shared === 1
              ? " (1 shared episode: a straddling episode, or an off-by-one)"
              : ` (${shared} shared episodes; episodes are cumulative across seasons)`),
        ),
      ];
    }
    const size = start - prevEnd - 1;
    return size > 0
      ? [
          finding(
            gapSeverity(size),
            "episode-gap",
            series,
            `episodes ${prevEnd + 1}-${start - 1} belong to no arc (between "${prevName}" and "${name}")`,
          ),
        ]
      : [];
  });

  const firstStart = adapted[0]?.episode_start ?? 1;
  const opening =
    adapted.length > 0 && firstStart !== 1
      ? [
          finding(
            "warn",
            "episode-start-offset",
            series,
            `first adapted arc starts at episode ${firstStart}, not 1`,
          ),
        ]
      : [];

  return [...sandwiched, ...flow, ...opening];
};

/** `season` drives per-season coverage UI; partial tagging renders half a chart. */
const checkSeasonTagging = (
  series: SeriesRow,
  arcs: readonly ArcRow[],
): Finding[] => {
  const adapted = arcs.filter((a) => a.episode_start !== null);
  const tagged = adapted.filter((a) => a.season !== null);
  if (tagged.length === 0 || tagged.length === adapted.length) return [];
  return [
    finding(
      "warn",
      "season-partial",
      series,
      `${tagged.length}/${adapted.length} adapted arcs carry a season number; season coverage UI needs all or none`,
    ),
  ];
};

const checkMovies = (
  series: SeriesRow,
  arcs: readonly ArcRow[],
  movies: readonly MovieRow[],
): Finding[] => {
  const maxEpisode = arcs.reduce(
    (max, a) => Math.max(max, a.episode_end ?? 0),
    0,
  );
  const minChapter = arcs.reduce(
    (min, a) => Math.min(min, a.chapter_start),
    Number.MAX_SAFE_INTEGER,
  );
  const maxChapter = arcs.reduce((max, a) => Math.max(max, a.chapter_end), 0);

  return movies.flatMap((m) => {
    const inverted =
      m.chapter_start !== null &&
      m.chapter_end !== null &&
      m.chapter_start > m.chapter_end
        ? [
            finding(
              "error",
              "movie-chapter-inverted",
              series,
              `"${m.title}" has chapters ${m.chapter_start}-${m.chapter_end} (start after end)`,
            ),
          ]
        : [];
    const outsideChapters =
      m.chapter_start !== null &&
      m.chapter_end !== null &&
      (m.chapter_start < minChapter || m.chapter_end > maxChapter)
        ? [
            finding(
              "warn",
              "movie-chapters-outside-arcs",
              series,
              `"${m.title}" adapts chapters ${m.chapter_start}-${m.chapter_end}, outside the mapped range ${minChapter}-${maxChapter}`,
            ),
          ]
        : [];
    const beyondEpisodes =
      m.after_episode !== null && maxEpisode > 0 && m.after_episode > maxEpisode
        ? [
            finding(
              "warn",
              "movie-after-episode-beyond",
              series,
              `"${m.title}" sits after episode ${m.after_episode} but the catalog only maps through ${maxEpisode}`,
            ),
          ]
        : [];
    const badYear =
      m.year < 1950 || m.year > new Date().getFullYear() + 2
        ? [
            finding(
              "warn",
              "movie-year-suspect",
              series,
              `"${m.title}" is dated ${m.year}`,
            ),
          ]
        : [];
    return [...inverted, ...outsideChapters, ...beyondEpisodes, ...badYear];
  });
};

const checkSeries = (series: SeriesRow): Finding[] => {
  const arcs = byPosition(series.arc_mappings);
  const movies = byPosition(series.movies);

  if (arcs.length === 0) {
    return [
      finding("error", "no-arcs", series, "series row has zero arc_mappings"),
    ];
  }

  return [
    ...checkPositions(series, arcs, "arc_mappings"),
    ...checkPositions(series, movies, "movies"),
    ...checkArcRanges(series, arcs),
    ...checkChapterContinuity(series, arcs),
    ...checkEpisodeContinuity(series, arcs),
    ...checkSeasonTagging(series, arcs),
    ...checkMovies(series, arcs, movies),
    ...(series.source_notes
      ? []
      : [
          finding(
            "info",
            "missing-source-notes",
            series,
            "no source_notes; the arc-mapping convention expects cumulative-episode arithmetic and manga state recorded here",
          ),
        ]),
  ];
};

/** Two series sharing a manga id resolve to the lowest series id. Worth surfacing. */
const checkDuplicateMangaIds = (rows: readonly SeriesRow[]): Finding[] =>
  [
    ...rows
      .reduce((acc, s) => {
        acc.set(s.anilist_manga_id, [
          ...(acc.get(s.anilist_manga_id) ?? []),
          s,
        ]);
        return acc;
      }, new Map<number, SeriesRow[]>())
      .entries(),
  ]
    .filter(([, group]) => group.length > 1)
    .map(([mangaId, group]) => {
      const winner = group.reduce((a, b) => (a.id <= b.id ? a : b));
      return finding(
        "info",
        "shared-manga-id",
        winner,
        `manga ${mangaId} is shared by ${group.map((s) => s.title).join(", ")}; "${winner.title}" wins the lookup`,
      );
    });

const fetchAniListCounts = async (
  ids: readonly number[],
): Promise<Map<number, AniListCounts>> => {
  const pages = ids.reduce<number[][]>(
    (acc, id, i) =>
      i % ANILIST_PAGE_SIZE === 0
        ? [...acc, [id]]
        : [...acc.slice(0, -1), [...acc[acc.length - 1], id]],
    [],
  );

  const results = await pages.reduce<Promise<AniListCounts[]>>(
    (prev, page, i) =>
      prev.then(async (acc) => {
        if (i > 0) {
          await new Promise((r) => setTimeout(r, ANILIST_PAUSE_MS));
        }
        const res = await fetch(ANILIST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query($ids:[Int]){Page(perPage:${ANILIST_PAGE_SIZE}){media(id_in:$ids){id episodes chapters status}}}`,
            variables: { ids: page },
          }),
        });
        if (!res.ok) {
          throw new Error(`AniList ${res.status}: ${await res.text()}`);
        }
        const json: { data?: { Page?: { media?: AniListCounts[] } } } =
          await res.json();
        return [...acc, ...(json.data?.Page?.media ?? [])];
      }),
    Promise.resolve([]),
  );

  return new Map(results.map((m): [number, AniListCounts] => [m.id, m]));
};

const checkAgainstAniList = (
  series: SeriesRow,
  counts: Map<number, AniListCounts>,
): Finding[] => {
  const arcs = byPosition(series.arc_mappings);
  const lastChapter = arcs.reduce((max, a) => Math.max(max, a.chapter_end), 0);
  const lastEpisode = arcs.reduce(
    (max, a) => Math.max(max, a.episode_end ?? 0),
    0,
  );
  const manga = counts.get(series.anilist_manga_id);
  const anime = counts.get(series.anilist_anime_id);

  const mangaShort =
    manga?.chapters && lastChapter < manga.chapters
      ? [
          finding(
            "warn",
            "catalog-behind-manga",
            series,
            `arcs stop at chapter ${lastChapter}; AniList reports ${manga.chapters} chapters${manga.status === "RELEASING" ? " (still releasing)" : ""}`,
          ),
        ]
      : [];
  const mangaOver =
    manga?.chapters && lastChapter > manga.chapters
      ? [
          finding(
            "info",
            "catalog-ahead-of-manga",
            series,
            `arcs run to chapter ${lastChapter}; AniList reports only ${manga.chapters} (AniList counts lag ongoing series)`,
          ),
        ]
      : [];
  // A shortfall is NOT an error. This catalog maps the episodes that adapt
  // manga; AniList reports every episode the anime aired. The two diverge
  // whenever the anime outruns its source, which is the common case, not the
  // exception: an anime-original ending (Claymore eps 23-26, Soul Eater eps
  // 36-51), a tie-in manga cancelled mid-run (Great Pretender, SK8, Kill la
  // Kill), later anime arcs carrying their own manga id (Sword Art Online's
  // Fairy Dance), or AniList counting short-form segments that the mapping
  // folds into a half-hour edit (Saiki K: 120 shorts vs 24 episodes). Every
  // one of the 26 series this flagged at `error` was a documented, intentional
  // stop, so the check failed the release gate on 26 false positives and zero
  // real defects.
  //
  // Firing only when manga chapters are also left unmapped drops the cases
  // where the anime provably outran a fully mapped source, and `info` keeps
  // what remains visible without failing the gate. A mapping deliberately
  // stopped at an anime-original tail still lands here, so treat this as a
  // prompt to confirm intent, never as a defect on its own.
  const animeEpisodes = anime?.episodes ?? 0;
  const mangaChapters = manga?.chapters ?? 0;
  const animeShort =
    lastEpisode > 0 &&
    lastEpisode < animeEpisodes &&
    lastChapter < mangaChapters
      ? [
          finding(
            "info",
            "catalog-behind-anime",
            series,
            `arcs stop at episode ${lastEpisode} of ${animeEpisodes} and chapter ${lastChapter} of ${mangaChapters}; expected when the anime outruns its source, but confirm the mapping was stopped on purpose`,
          ),
        ]
      : [];
  const missing =
    !manga || !anime
      ? [
          finding(
            "warn",
            "anilist-id-unresolved",
            series,
            `AniList returned nothing for ${!manga ? `manga ${series.anilist_manga_id}` : ""}${!manga && !anime ? " and " : ""}${!anime ? `anime ${series.anilist_anime_id}` : ""}`,
          ),
        ]
      : [];

  return [...mangaShort, ...mangaOver, ...animeShort, ...missing];
};

/**
 * `{ "<series title>": { "<finding code>": "why this is intentional" } }`
 *
 * Suppression is per series + code, not per individual finding, because a single
 * modelling decision usually produces the same code several times in one series.
 * The trade-off: a genuinely new bug of an already-triaged code in an
 * already-triaged series stays hidden. Re-run with `--no-ignore` when editing a
 * series that has entries here.
 */
type IgnoreFile = Record<string, Record<string, string>>;

const IGNORE_PATH = path.join(__dirname, "audit-ignore.json");

const isCodeMap = (value: unknown): value is Record<string, string> =>
  !!value &&
  typeof value === "object" &&
  Object.values(value).every((v) => typeof v === "string");

const isIgnoreFile = (value: unknown): value is IgnoreFile =>
  !!value && typeof value === "object" && Object.values(value).every(isCodeMap);

const loadIgnores = (): IgnoreFile => {
  if (!fs.existsSync(IGNORE_PATH)) return {};
  const parsed: unknown = JSON.parse(fs.readFileSync(IGNORE_PATH, "utf8"));
  if (!isIgnoreFile(parsed)) {
    throw new Error(
      `${IGNORE_PATH} must be { "<series>": { "<code>": "<reason>" } }`,
    );
  }
  return parsed;
};

const isIgnored = (f: Finding, ignores: IgnoreFile): boolean =>
  !!ignores[f.series]?.[f.code];

const SEVERITY_ICON: Record<Severity, string> = {
  error: "✗",
  warn: "!",
  info: "·",
};

const fetchCatalog = async (): Promise<SeriesRow[]> => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const page = async (offset: number): Promise<SeriesRow[]> => {
    const { data, error } = await supabase
      .from("series")
      .select("*, arc_mappings(*), movies(*)")
      .order("id", { ascending: true })
      .range(offset, offset + POSTGREST_PAGE - 1)
      .returns<SeriesRow[]>();
    if (error) throw new Error(`catalog fetch failed: ${error.message}`);
    const rows = data ?? [];
    return rows.length < POSTGREST_PAGE
      ? rows
      : [...rows, ...(await page(offset + POSTGREST_PAGE))];
  };
  return page(0);
};

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  const wantAniList = argv.includes("--anilist");
  const asJson = argv.includes("--json");
  const errorsOnly = argv.includes("--errors-only");
  const only = argv.includes("--series")
    ? (argv[argv.indexOf("--series") + 1] ?? "").toLowerCase()
    : null;

  const all = await fetchCatalog();
  const rows = only
    ? all.filter((s) => s.title.toLowerCase().includes(only))
    : all;

  if (rows.length === 0) {
    console.error(only ? `no series matching "${only}"` : "catalog is empty");
    process.exit(1);
  }

  const anilistCounts = wantAniList
    ? await fetchAniListCounts([
        ...new Set(
          rows.flatMap((s) => [s.anilist_manga_id, s.anilist_anime_id]),
        ),
      ])
    : new Map<number, AniListCounts>();

  const ignores = argv.includes("--no-ignore") ? {} : loadIgnores();
  const raw = [
    ...rows.flatMap(checkSeries),
    ...checkDuplicateMangaIds(rows),
    ...(wantAniList
      ? rows.flatMap((s) => checkAgainstAniList(s, anilistCounts))
      : []),
  ];
  const suppressed = raw.filter((f) => isIgnored(f, ignores)).length;
  const findings = raw
    .filter((f) => !isIgnored(f, ignores))
    .filter((f) => !errorsOnly || f.severity === "error");

  if (asJson) {
    console.log(
      JSON.stringify(
        { seriesAudited: rows.length, suppressed, findings },
        null,
        2,
      ),
    );
    process.exit(findings.some((f) => f.severity === "error") ? 1 : 0);
  }

  const grouped = findings.reduce((acc, f) => {
    acc.set(f.series, [...(acc.get(f.series) ?? []), f]);
    return acc;
  }, new Map<string, Finding[]>());

  [...grouped.entries()].forEach(([title, group]) => {
    console.log(`\n${title}`);
    [...group]
      .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
      .forEach((f) => {
        console.log(`  ${SEVERITY_ICON[f.severity]} [${f.code}] ${f.message}`);
      });
  });

  const tally = (s: Severity): number =>
    findings.filter((f) => f.severity === s).length;
  console.log(
    `\naudited ${rows.length} series: ${tally("error")} errors, ${tally("warn")} warnings, ${tally("info")} info` +
      (suppressed > 0 ? ` (${suppressed} triaged, --no-ignore to show)` : ""),
  );
  process.exit(tally("error") > 0 ? 1 : 0);
};

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
