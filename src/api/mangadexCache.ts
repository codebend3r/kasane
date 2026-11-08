import { supabase } from "@/api/supabase";
import { rowToSnapshot, type MangaDexSnapshot } from "@/data/mangadexSnapshot";

/**
 * The cached MangaDex lookup for an AniList manga, or null when the cache has
 * no row for it. `scripts/refresh-mangadex.ts` fills the table for every
 * catalog series; the caller falls back to the live lookup on null.
 */
export async function fetchCachedMangaDex(
  anilistMangaId: number,
): Promise<MangaDexSnapshot | null> {
  const { data, error } = await supabase
    .from("mangadex_series")
    .select("*")
    .eq("anilist_manga_id", anilistMangaId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToSnapshot(data) : null;
}
