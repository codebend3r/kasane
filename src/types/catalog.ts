import type { Database } from "@/types/supabase";

type Tables = Database["public"]["Tables"];

export type ArcRow = Tables["arc_mappings"]["Row"];
export type MovieRow = Tables["movies"]["Row"];

/** A `series` row with its arcs and films embedded, as the catalog selects it. */
export type SeriesRow = Tables["series"]["Row"] & {
  arc_mappings: ArcRow[];
  movies: MovieRow[];
};
