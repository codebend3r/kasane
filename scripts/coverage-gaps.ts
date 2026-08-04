/**
 * Which popular adapted series does the catalog NOT curate yet?
 *
 * Any series without a curated `series` row falls back to
 * `buildSyntheticMapping`, which distributes episodes evenly across chapters and
 * is usually wrong. This ranks the unmapped series by AniList popularity, so the
 * next mapping to research is the one the most users will hit.
 *
 * Run:
 *   bun run scripts/coverage-gaps.ts                # top 100 by popularity
 *   bun run scripts/coverage-gaps.ts --pages 10     # widen the sweep (50/page)
 *   bun run scripts/coverage-gaps.ts --sort SCORE_DESC
 *   bun run scripts/coverage-gaps.ts --json
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://obtgldkascmxbtpnvscn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4z9kuzXtE3PeVgbPDtQUWw_cSrKxsu-";

const ANILIST_URL = "https://graphql.anilist.co";
const PER_PAGE = 50;
const PAUSE_MS = 1200;

type Edge = {
  relationType: string;
  node: { id: number; type: string; episodes: number | null };
};

type MangaNode = {
  id: number;
  title: { romaji: string; english: string | null };
  chapters: number | null;
  status: string | null;
  popularity: number;
  averageScore: number | null;
  genres: string[];
  relations: { edges: Edge[] };
};

type Gap = {
  mangaId: number;
  animeId: number;
  title: string;
  chapters: number | null;
  episodes: number | null;
  status: string | null;
  popularity: number;
  score: number | null;
  genres: string[];
};

const QUERY = `
query($page: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: ${PER_PAGE}) {
    media(type: MANGA, sort: $sort, isAdult: false) {
      id
      title { romaji english }
      chapters
      status
      popularity
      averageScore
      genres
      relations { edges { relationType(version: 2) node { id type episodes } } }
    }
  }
}`;

const fetchPage = async (page: number, sort: string): Promise<MangaNode[]> => {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { page, sort: [sort] } }),
  });
  if (!res.ok) throw new Error(`AniList ${res.status}: ${await res.text()}`);
  const json: { data?: { Page?: { media?: MangaNode[] } } } = await res.json();
  return json.data?.Page?.media ?? [];
};

/** Keep only manga that actually have an anime adaptation to map against. */
const toGap = (m: MangaNode): Gap | null => {
  const adaptation = m.relations.edges.find(
    (e) => e.relationType === "ADAPTATION" && e.node.type === "ANIME",
  );
  if (!adaptation) return null;
  return {
    mangaId: m.id,
    animeId: adaptation.node.id,
    title: m.title.english ?? m.title.romaji,
    chapters: m.chapters,
    episodes: adaptation.node.episodes,
    status: m.status,
    popularity: m.popularity,
    score: m.averageScore,
    genres: m.genres,
  };
};

type Curated = { ids: Set<number>; titles: Set<string> };

/**
 * AniList carries several manga entries per franchise (main series, spin-offs,
 * colour editions), so an id miss does not prove the franchise is uncurated.
 * Normalised titles catch those, at the cost of hiding a genuinely separate
 * series that happens to share a name.
 */
const normalise = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const fetchCurated = async (): Promise<Curated> => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await supabase
    .from("series")
    .select("anilist_anime_id, anilist_manga_id, title")
    .returns<
      { anilist_anime_id: number; anilist_manga_id: number; title: string }[]
    >();
  if (error) throw new Error(`catalog fetch failed: ${error.message}`);
  const rows = data ?? [];
  return {
    ids: new Set(rows.flatMap((r) => [r.anilist_anime_id, r.anilist_manga_id])),
    titles: new Set(rows.map((r) => normalise(r.title))),
  };
};

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  const asJson = argv.includes("--json");
  const pages = argv.includes("--pages")
    ? Math.max(1, Number(argv[argv.indexOf("--pages") + 1] ?? 2))
    : 2;
  const sort = argv.includes("--sort")
    ? (argv[argv.indexOf("--sort") + 1] ?? "POPULARITY_DESC")
    : "POPULARITY_DESC";

  const curated = await fetchCurated();

  const media = await Array.from({ length: pages }, (_, i) => i + 1).reduce<
    Promise<MangaNode[]>
  >(
    (prev, page, i) =>
      prev.then(async (acc) => {
        if (i > 0) await new Promise((r) => setTimeout(r, PAUSE_MS));
        return [...acc, ...(await fetchPage(page, sort))];
      }),
    Promise.resolve([]),
  );

  const gaps = media
    .map(toGap)
    .filter((g): g is Gap => g !== null)
    .filter((g) => !curated.ids.has(g.mangaId) && !curated.ids.has(g.animeId))
    .filter((g) => !curated.titles.has(normalise(g.title)));

  if (asJson) {
    console.log(
      JSON.stringify(
        { scanned: media.length, curatedSeries: curated.titles.size, gaps },
        null,
        2,
      ),
    );
    return;
  }

  console.log(
    `scanned ${media.length} adapted manga by ${sort}; ${gaps.length} have no curated mapping\n`,
  );
  gaps.forEach((g, i) => {
    const counts = `${g.episodes ?? "?"} eps / ${g.chapters ?? "?"} ch`;
    console.log(
      `${String(i + 1).padStart(3)}. ${g.title}\n` +
        `     anime ${g.animeId} · manga ${g.mangaId} · ${counts} · ${g.status ?? "?"} · popularity ${g.popularity}`,
    );
  });
};

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
