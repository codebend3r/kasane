/**
 * MangaDex cache refresh.
 *
 * Looks every catalog manga up on MangaDex the way the app does (title search,
 * covers, aggregate) and writes the result to `mangadex_series`, so a series
 * page reads one Supabase row instead of making three to five MangaDex calls
 * through the proxy. The app still falls back to the live lookup for a manga
 * with no row here.
 *
 * Writes need the service role, which never reaches the client. Set
 * `SUPABASE_SERVICE_ROLE_KEY` in the environment or `scripts/.env.local`,
 * which `bun run mangadex:refresh` loads; `SUPABASE_URL` overrides the
 * production URL (for the local stack).
 *
 * Run:
 *   bun run mangadex:refresh                   # rows older than 7 days
 *   bun run mangadex:refresh -- --force        # every row
 *   bun run mangadex:refresh -- --series naruto
 *   bun run mangadex:refresh -- --dry-run      # look up, write nothing
 */
import { createClient } from "@supabase/supabase-js";
import { getMediaByIds } from "@/api/anilist";
import { getMangaDexSnapshot, scriptMangaDexClient } from "@/api/mangadex";
import { SUPABASE_URL } from "@/api/supabaseConfig";
import { englishTitle } from "@/data/format";
import type { MangaDexSnapshot } from "@/data/mangadexSnapshot";
import { DAY_MS } from "@/data/time";
import type { Database } from "@/types/supabase";

const MANGADEX_PAUSE_MS = 1500;
const STALE_AFTER_MS = 7 * DAY_MS;

type Target = { anilistMangaId: number; title: string };
type Outcome = "written" | "unmatched" | "failed" | "skipped";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  const only = argv.includes("--series")
    ? (argv[argv.indexOf("--series") + 1] ?? "").toLowerCase()
    : null;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to scripts/.env.local.",
    );
    process.exit(1);
  }
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL ?? SUPABASE_URL,
    serviceKey,
    { auth: { persistSession: false } },
  );

  const [seriesRes, cachedRes] = await Promise.all([
    supabase.from("series").select("anilist_manga_id, title"),
    supabase.from("mangadex_series").select("anilist_manga_id, fetched_at"),
  ]);
  if (seriesRes.error) throw new Error(seriesRes.error.message);
  if (cachedRes.error) throw new Error(cachedRes.error.message);

  const freshUntil = Date.now() - STALE_AFTER_MS;
  const fresh = new Set(
    cachedRes.data
      .filter((r) => new Date(r.fetched_at).getTime() > freshUntil)
      .map((r) => r.anilist_manga_id),
  );
  const wanted = [
    ...new Map(
      seriesRes.data
        .filter((s) => !only || s.title.toLowerCase().includes(only))
        .filter((s) => force || !fresh.has(s.anilist_manga_id))
        .map((s) => [s.anilist_manga_id, s.title]),
    ),
  ];
  console.log(
    `${seriesRes.data.length} catalog series, ${wanted.length} to refresh${dryRun ? " (dry run)" : ""}`,
  );
  if (wanted.length === 0) return;

  // The app searches MangaDex by AniList's English title, so the cache does
  // the same rather than trusting the catalog's own title column.
  const media = await getMediaByIds(wanted.map(([id]) => id));
  const titles = new Map(media.map((m) => [m.id, englishTitle(m.title)]));
  const targets: Target[] = wanted.map(([anilistMangaId, catalogTitle]) => ({
    anilistMangaId,
    title: titles.get(anilistMangaId) ?? catalogTitle,
  }));

  const write = async (
    target: Target,
    snapshot: MangaDexSnapshot,
  ): Promise<void> => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("mangadex_series").upsert(
      {
        anilist_manga_id: target.anilistMangaId,
        mangadex_id: snapshot.mangadexId,
        titles: snapshot.titles,
        covers: snapshot.covers,
        volumes: snapshot.volumes,
        chapters: snapshot.chapters,
        fetched_at: now,
        updated_at: now,
      },
      { onConflict: "anilist_manga_id" },
    );
    if (error) throw new Error(error.message);
  };

  const refresh = async (target: Target): Promise<Outcome> => {
    try {
      const snapshot = await getMangaDexSnapshot({
        client: scriptMangaDexClient,
        anilistId: target.anilistMangaId,
        title: target.title,
      });
      if (!snapshot) {
        console.log(`  ? ${target.title}: no MangaDex match`);
        return "unmatched";
      }
      console.log(
        `  ${dryRun ? "·" : "✓"} ${target.title}: ${snapshot.covers.length} covers, ${snapshot.volumes} vol, ${snapshot.chapters} ch`,
      );
      if (dryRun) return "skipped";
      await write(target, snapshot);
      return "written";
    } catch (error) {
      console.log(
        `  ✗ ${target.title}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return "failed";
    }
  };

  // One series at a time with a pause: MangaDex allows about five requests a
  // second and each lookup is three or more.
  const outcomes = await targets.reduce<Promise<Outcome[]>>(
    async (accPromise, target, i) => {
      const acc = await accPromise;
      if (i > 0) await sleep(MANGADEX_PAUSE_MS);
      return [...acc, await refresh(target)];
    },
    Promise.resolve([]),
  );

  const count = (o: Outcome): number => outcomes.filter((x) => x === o).length;
  console.log(
    `written ${count("written")}, unmatched ${count("unmatched")}, failed ${count("failed")}${dryRun ? `, looked up ${count("skipped")}` : ""}`,
  );
  if (count("failed") > 0) process.exit(1);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
