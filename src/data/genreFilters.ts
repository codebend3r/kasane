export type GenreFilterKind = 'genre' | 'tag';

export type GenreFilter = {
  id: string;
  label: string;
  kind: GenreFilterKind;
  token: string;
};

export const GENRE_FILTERS: readonly GenreFilter[] = [
  { id: 'shounen', label: 'Shounen', kind: 'tag', token: 'Shounen' },
  { id: 'shoujo', label: 'Shoujo', kind: 'tag', token: 'Shoujo' },
  { id: 'seinen', label: 'Seinen', kind: 'tag', token: 'Seinen' },
  { id: 'josei', label: 'Josei', kind: 'tag', token: 'Josei' },
  { id: 'kids', label: 'Kids', kind: 'tag', token: 'Kids' },
  { id: 'action', label: 'Action', kind: 'genre', token: 'Action' },
  { id: 'adventure', label: 'Adventure', kind: 'genre', token: 'Adventure' },
  { id: 'comedy', label: 'Comedy', kind: 'genre', token: 'Comedy' },
  { id: 'drama', label: 'Drama', kind: 'genre', token: 'Drama' },
  { id: 'romance', label: 'Romance', kind: 'genre', token: 'Romance' },
  {
    id: 'slice-of-life',
    label: 'Slice of Life',
    kind: 'genre',
    token: 'Slice of Life',
  },
  { id: 'mystery', label: 'Mystery', kind: 'genre', token: 'Mystery' },
  {
    id: 'psychological',
    label: 'Psychological',
    kind: 'genre',
    token: 'Psychological',
  },
  { id: 'thriller', label: 'Thriller', kind: 'genre', token: 'Thriller' },
  { id: 'horror', label: 'Horror', kind: 'genre', token: 'Horror' },
  { id: 'mecha', label: 'Mecha', kind: 'genre', token: 'Mecha' },
  {
    id: 'mahou-shoujo',
    label: 'Magical Girl',
    kind: 'genre',
    token: 'Mahou Shoujo',
  },
  { id: 'sports', label: 'Sports', kind: 'genre', token: 'Sports' },
  { id: 'music', label: 'Music', kind: 'genre', token: 'Music' },
  { id: 'isekai', label: 'Isekai', kind: 'tag', token: 'Isekai' },
  { id: 'iyashikei', label: 'Iyashikei', kind: 'tag', token: 'Iyashikei' },
  { id: 'yuri', label: 'Yuri', kind: 'tag', token: 'Yuri' },
  { id: 'bl', label: 'BL', kind: 'tag', token: "Boys' Love" },
  { id: 'cooking', label: 'Cooking', kind: 'tag', token: 'Cooking' },
  {
    id: 'dark-fantasy',
    label: 'Dark Fantasy',
    kind: 'tag',
    token: 'Dark Fantasy',
  },
  { id: 'harem', label: 'Harem', kind: 'tag', token: 'Harem' },
  {
    id: 'reverse-harem',
    label: 'Reverse Harem',
    kind: 'tag',
    token: 'Reverse Harem',
  },
  { id: 'ecchi', label: 'Ecchi', kind: 'genre', token: 'Ecchi' },
];

export type SplitFilters = {
  genreNotIn: string[] | null;
  tagNotIn: string[] | null;
};

export function splitHiddenForAniList(hiddenIds: string[]): SplitFilters {
  const genres: string[] = [];
  const tags: string[] = [];
  const sorted = [...hiddenIds].sort();
  for (const id of sorted) {
    const entry = GENRE_FILTERS.find((f) => f.id === id);
    if (!entry) continue;
    if (entry.kind === 'genre') {
      genres.push(entry.token);
    } else {
      tags.push(entry.token);
    }
  }
  return {
    genreNotIn: genres.length > 0 ? genres : null,
    tagNotIn: tags.length > 0 ? tags : null,
  };
}
