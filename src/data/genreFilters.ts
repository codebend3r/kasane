export type GenreFilterKind = "genre" | "tag";

export type GenreFilter = {
  id: string;
  label: string;
  kind: GenreFilterKind;
  token: string;
};

// AniList genres always excluded from results regardless of user choice. These
// are app policy, not toggleable chips, so they stay in code rather than the
// `genre_filters` table.
const ALWAYS_HIDDEN_GENRES: readonly string[] = ["Ecchi", "Hentai"];
const ALWAYS_HIDDEN_TAGS: readonly string[] = [];

export type SplitFilters = {
  genreNotIn: string[] | null;
  tagNotIn: string[] | null;
};

export function splitHiddenForAniList(
  hiddenIds: string[],
  filters: readonly GenreFilter[],
): SplitFilters {
  const matched = [...hiddenIds]
    .sort()
    .map((id) => filters.find((f) => f.id === id))
    .filter((e): e is GenreFilter => !!e);
  const genres = [
    ...ALWAYS_HIDDEN_GENRES,
    ...matched.filter((e) => e.kind === "genre").map((e) => e.token),
  ];
  const tags = [
    ...ALWAYS_HIDDEN_TAGS,
    ...matched.filter((e) => e.kind === "tag").map((e) => e.token),
  ];
  return {
    genreNotIn: genres.length > 0 ? genres : null,
    tagNotIn: tags.length > 0 ? tags : null,
  };
}
