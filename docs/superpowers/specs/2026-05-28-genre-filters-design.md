# genre-filters — Design

**Date:** 2026-05-28
**Status:** Initial design

## Purpose

Replace the single "Hide ecchi" toggle on the home screen with a broader set of **exclude-only** genre filters covering demographic and thematic anime/manga genres. Users can opt out of any combination of genres; choices persist across launches and apply to both search results and the latest-anime discovery grid.

## Scope

- Home screen (`app/index.tsx`) only. Detail screens are unaffected.
- Exclude-only semantics — every chip is a "Hide X" toggle. No include/whitelist mode.
- Filters apply to **both** the search query and the latest-anime grid (matches current ecchi behavior).
- Default state: **Ecchi excluded**, everything else allowed. Matches current behavior.
- Persistence via AsyncStorage so users opt out once. The existing `japanese` toggle is retrofitted onto the same persisted store so behavior is consistent across preferences.

## Filter catalog

A single static array defined in `src/data/genreFilters.ts`. Each entry has:

```ts
export type GenreFilter = {
  id: string; // stable key, e.g. 'ecchi', 'mahou-shoujo'
  label: string; // display string for the chip
  kind: "genre" | "tag";
  token: string; // exact AniList token (case-sensitive)
};
```

The list, in chip-render order (demographics first, then thematic, then tone modifiers):

| id            | label         | kind  | token         |
| ------------- | ------------- | ----- | ------------- |
| shounen       | Shounen       | tag   | Shounen       |
| shoujo        | Shoujo        | tag   | Shoujo        |
| seinen        | Seinen        | tag   | Seinen        |
| josei         | Josei         | tag   | Josei         |
| kids          | Kids          | tag   | Kids          |
| action        | Action        | genre | Action        |
| adventure     | Adventure     | genre | Adventure     |
| comedy        | Comedy        | genre | Comedy        |
| drama         | Drama         | genre | Drama         |
| romance       | Romance       | genre | Romance       |
| slice-of-life | Slice of Life | genre | Slice of Life |
| mystery       | Mystery       | genre | Mystery       |
| psychological | Psychological | genre | Psychological |
| thriller      | Thriller      | genre | Thriller      |
| horror        | Horror        | genre | Horror        |
| mecha         | Mecha         | genre | Mecha         |
| mahou-shoujo  | Magical Girl  | genre | Mahou Shoujo  |
| sports        | Sports        | genre | Sports        |
| music         | Music         | genre | Music         |
| isekai        | Isekai        | tag   | Isekai        |
| iyashikei     | Iyashikei     | tag   | Iyashikei     |
| yuri          | Yuri          | tag   | Yuri          |
| bl            | BL            | tag   | Boys' Love    |
| cooking       | Cooking       | tag   | Cooking       |
| dark-fantasy  | Dark Fantasy  | tag   | Dark Fantasy  |
| harem         | Harem         | tag   | Harem         |
| reverse-harem | Reverse Harem | tag   | Reverse Harem |
| ecchi         | Ecchi         | genre | Ecchi         |

The `kind` field is what splits a selection set into the two AniList query variables (`genre_not_in`, `tag_not_in`).

## State management

`src/state/preferences.ts` is upgraded to use zustand's `persist` middleware (AsyncStorage on native, `localStorage` on web — both behind the same `@react-native-async-storage/async-storage` adapter that zustand's `persist` supports out of the box).

New shape:

```ts
type State = {
  japanese: boolean;
  toggleJapanese: () => void;

  hiddenGenres: string[]; // array of GenreFilter.id values
  toggleHiddenGenre: (id: string) => void;
};
```

- `hiddenGenres` default: `['ecchi']`.
- `toggleHiddenGenre(id)` adds/removes from the array.
- Persist key: `kasane-preferences`. Version `1` (so future migrations are possible if the catalog changes shape).

Install dependency: `bun add @react-native-async-storage/async-storage`. Zustand's `persist` is already available through the existing `zustand` install.

## AniList query changes

`src/api/anilist.ts` already passes `genre_not_in`. Add a sibling `tag_not_in` variable to all three queries (`SEARCH_TYPED_QUERY`, `SEARCH_ANY_QUERY`, `LATEST_ANIME_QUERY`):

```graphql
query LatestAnime($genreNotIn: [String], $tagNotIn: [String]) {
  Page(perPage: 50) {
    media(
      type: ANIME
      format: TV
      sort: [START_DATE_DESC, POPULARITY_DESC]
      status_in: [RELEASING, FINISHED]
      isAdult: false
      genre_not_in: $genreNotIn
      tag_not_in: $tagNotIn
    ) { ... }
  }
}
```

`searchMedia` and `getLatestAnime` get a new optional `tagNotIn` parameter alongside the existing `genreNotIn`. Both default to `null`. AniList ignores `null` filters, so passing `null` is equivalent to omitting them.

## Splitting the selection at the call site

A small helper in `src/data/genreFilters.ts`:

```ts
export function splitHiddenForAniList(hiddenIds: string[]): {
  genreNotIn: string[] | null;
  tagNotIn: string[] | null;
} {
  const genres: string[] = [];
  const tags: string[] = [];
  for (const id of hiddenIds) {
    const entry = GENRE_FILTERS.find((f) => f.id === id);
    if (!entry) continue;
    (entry.kind === "genre" ? genres : tags).push(entry.token);
  }
  return {
    genreNotIn: genres.length > 0 ? genres : null,
    tagNotIn: tags.length > 0 ? tags : null,
  };
}
```

`app/index.tsx` calls `splitHiddenForAniList(hiddenGenres)` and passes both arrays into the React Query `queryKey` and the fetcher.

## UI changes in `app/index.tsx`

Replace the single ecchi chip with a wrapping row of all 28 chips, always visible (even on the latest-anime grid). The existing `styles.filters` row uses `flexDirection: 'row'` with `gap: 8`. Add `flexWrap: 'wrap'` and `rowGap: 8`.

Chip rendering loop:

```tsx
<View style={styles.genreFilters}>
  {GENRE_FILTERS.map((f) => {
    const active = hiddenGenres.includes(f.id);
    return (
      <Pressable
        key={f.id}
        onPress={() => toggleHiddenGenre(f.id)}
        style={[styles.filterChip, active && styles.filterChipActive]}
      >
        <Text style={[styles.filterText, active && styles.filterTextActive]}>
          {active ? `× ${f.label}` : f.label}
        </Text>
      </Pressable>
    );
  })}
</View>
```

Style: reuse existing `filterChip` / `filterChipActive` / `filterText` / `filterTextActive`. New `genreFilters` style:

```ts
genreFilters: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  rowGap: 8,
},
```

The `[All / Anime / Manga]` row remains separate and only renders while searching — no change to that.

The local `hideEcchi` `useState` and its chip are removed. The `genreNotIn` computation moves to use `splitHiddenForAniList`.

## React Query cache keys

Both queries' `queryKey` arrays gain `tagNotIn`:

```ts
queryKey: ["search", debouncedQuery, type, genreNotIn, tagNotIn];
queryKey: ["latest-anime", genreNotIn, tagNotIn];
```

Arrays are stable references when produced from the same sorted source, so to avoid cache misses on re-renders we sort `hiddenGenres` once inside `splitHiddenForAniList` before pushing into the two output arrays.

## Files touched

- **New:** `src/data/genreFilters.ts` — catalog + `splitHiddenForAniList`.
- **Modified:** `src/state/preferences.ts` — add zustand `persist` middleware, add `hiddenGenres` + `toggleHiddenGenre`.
- **Modified:** `src/api/anilist.ts` — add `tagNotIn` to all three queries and both exported functions.
- **Modified:** `app/index.tsx` — replace single ecchi chip with the full catalog loop; remove local `hideEcchi` state; wire up the persisted store.
- **New dep:** `@react-native-async-storage/async-storage` via `bun add`.

## Out of scope

- Include/whitelist filters ("Show only isekai").
- Per-page filters on detail screens.
- Search/filter the filter list itself (a "find a genre" input).
- Section headers grouping demographic vs thematic.
- Migration of any previously-stored state (no prior persisted store exists).
- Visual redesign of the chip itself (sticking with the existing chip style).
