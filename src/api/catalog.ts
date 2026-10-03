import { supabase } from "@/api/supabase";
import {
  rowToMapping,
  toAliasTable,
  toGenreFilter,
  type Catalog,
} from "@/data/catalog";

/** The whole curated catalog: mappings, search aliases and genre chips. */
export async function fetchCatalog(): Promise<Catalog> {
  const [seriesRes, aliasRes, genreRes] = await Promise.all([
    supabase
      .from("series")
      .select("*, arc_mappings(*), movies(*)")
      .order("id", { ascending: true }),
    supabase.from("search_aliases").select("alias, target"),
    supabase
      .from("genre_filters")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (seriesRes.error) throw seriesRes.error;
  if (aliasRes.error) throw aliasRes.error;
  if (genreRes.error) throw genreRes.error;

  return {
    mappings: seriesRes.data.map(rowToMapping),
    aliases: toAliasTable(aliasRes.data),
    genreFilters: genreRes.data.map(toGenreFilter),
  };
}
