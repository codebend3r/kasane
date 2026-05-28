# Genre Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single "Hide ecchi" toggle on the home screen with a wrapping chip row of 28 demographic/thematic genre exclude filters, persisted across launches.

**Architecture:** A static catalog in `src/data/genreFilters.ts` enumerates each filter as either an AniList **genre** or **tag**. A helper splits the user's selected set into `genre_not_in` and `tag_not_in` arrays for the GraphQL queries. Persistence uses zustand's `persist` middleware backed by `@react-native-async-storage/async-storage` (which auto-falls-back to `localStorage` on web). The existing `japanese` preference is migrated onto the same persisted store.

**Tech Stack:** Expo Router, React Native + RN Web, TypeScript, zustand (+ `persist` middleware), `@react-native-async-storage/async-storage`, `graphql-request`, jest (for the one pure helper). Verification is `bun run typecheck`, `bun run test`, and a manual `bun run web` browser check.

**Spec:** `docs/superpowers/specs/2026-05-28-genre-filters-design.md`

**Per repo CLAUDE.md:**
- All new types use `type`, never `interface`.
- No `any`. Prefer type guards.
- Layout via `display: grid`/`gap`/`padding`. **Never** add `margin`. (RN equivalent: `gap`, `rowGap`, `columnGap`, `padding`.)
- One commit per discrete change. Subject `KSN: <short>`. Bullets in body. Backtick all identifiers/paths.
- Use `bun`, never `npm`.

---

## File Map

- **Create:** `src/data/genreFilters.ts` — `GenreFilter` type, `GENRE_FILTERS` catalog, `splitHiddenForAniList()` helper.
- **Create:** `src/data/genreFilters.test.ts` — jest tests for `splitHiddenForAniList`.
- **Modify:** `src/state/preferences.ts` — add zustand `persist` middleware; add `hiddenGenres`/`toggleHiddenGenre`; keep `japanese` on the same persisted store.
- **Modify:** `src/api/anilist.ts` — add `$tagNotIn` to `SEARCH_TYPED_QUERY`, `SEARCH_ANY_QUERY`, `LATEST_ANIME_QUERY`; add `tagNotIn` parameter to `searchMedia` and `getLatestAnime`.
- **Modify:** `app/index.tsx` — replace single ecchi chip + local `hideEcchi` state with persisted `hiddenGenres` chip row of all 28 filters; pass split arrays into both queries.
- **Add dep:** `@react-native-async-storage/async-storage` via `bun add`.

---

## Task 1: Add `@react-native-async-storage/async-storage` dependency

**Files:** `package.json`, `bun.lock`

- [ ] **Step 1.1: Install the dependency**

Run from repo root:

```bash
bun add @react-native-async-storage/async-storage
```

Expected: package added to `dependencies` in `package.json`, `bun.lock` updated.

- [ ] **Step 1.2: Sanity-check typecheck still passes**

Run:

```bash
bun run typecheck
```

Expected: exits 0, no output.

- [ ] **Step 1.3: Commit**

```bash
git add package.json bun.lock
git commit -m "$(cat <<'EOF'
KSN: add `@react-native-async-storage/async-storage` dep

- needed for zustand `persist` middleware backing genre filter prefs
EOF
)"
```

---

## Task 2: Create genre filter catalog + pure helper (TDD)

**Files:**
- Create: `src/data/genreFilters.ts`
- Create: `src/data/genreFilters.test.ts`

- [ ] **Step 2.1: Write the failing test**

Create `src/data/genreFilters.test.ts` with the full contents:

```ts
import {
  GENRE_FILTERS,
  splitHiddenForAniList,
} from './genreFilters';

describe('GENRE_FILTERS catalog', () => {
  it('has 28 entries', () => {
    expect(GENRE_FILTERS).toHaveLength(28);
  });

  it('has unique ids', () => {
    const ids = GENRE_FILTERS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique tokens within each kind', () => {
    const genres = GENRE_FILTERS.filter((f) => f.kind === 'genre').map(
      (f) => f.token
    );
    const tags = GENRE_FILTERS.filter((f) => f.kind === 'tag').map(
      (f) => f.token
    );
    expect(new Set(genres).size).toBe(genres.length);
    expect(new Set(tags).size).toBe(tags.length);
  });

  it('contains Ecchi as a genre', () => {
    const ecchi = GENRE_FILTERS.find((f) => f.id === 'ecchi');
    expect(ecchi).toEqual({
      id: 'ecchi',
      label: 'Ecchi',
      kind: 'genre',
      token: 'Ecchi',
    });
  });

  it("contains BL with token \"Boys' Love\"", () => {
    const bl = GENRE_FILTERS.find((f) => f.id === 'bl');
    expect(bl?.kind).toBe('tag');
    expect(bl?.token).toBe("Boys' Love");
  });
});

describe('splitHiddenForAniList', () => {
  it('returns nulls for an empty selection', () => {
    expect(splitHiddenForAniList([])).toEqual({
      genreNotIn: null,
      tagNotIn: null,
    });
  });

  it('routes a genre id into genreNotIn', () => {
    expect(splitHiddenForAniList(['ecchi'])).toEqual({
      genreNotIn: ['Ecchi'],
      tagNotIn: null,
    });
  });

  it('routes a tag id into tagNotIn', () => {
    expect(splitHiddenForAniList(['isekai'])).toEqual({
      genreNotIn: null,
      tagNotIn: ['Isekai'],
    });
  });

  it('splits mixed selections into the right buckets', () => {
    const out = splitHiddenForAniList(['ecchi', 'isekai', 'horror', 'bl']);
    expect(out.genreNotIn?.sort()).toEqual(['Ecchi', 'Horror']);
    expect(out.tagNotIn?.sort()).toEqual(["Boys' Love", 'Isekai']);
  });

  it('produces stable output regardless of input order', () => {
    const a = splitHiddenForAniList(['horror', 'ecchi']);
    const b = splitHiddenForAniList(['ecchi', 'horror']);
    expect(a).toEqual(b);
  });

  it('ignores unknown ids without throwing', () => {
    expect(splitHiddenForAniList(['ecchi', 'nonexistent-id'])).toEqual({
      genreNotIn: ['Ecchi'],
      tagNotIn: null,
    });
  });
});
```

- [ ] **Step 2.2: Run the test to verify it fails**

Run:

```bash
bun run test src/data/genreFilters.test.ts
```

Expected: FAIL — `Cannot find module './genreFilters'`.

- [ ] **Step 2.3: Implement the catalog and helper**

Create `src/data/genreFilters.ts` with the full contents:

```ts
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
```

- [ ] **Step 2.4: Run the test to verify it passes**

Run:

```bash
bun run test src/data/genreFilters.test.ts
```

Expected: PASS (11 tests).

- [ ] **Step 2.5: Run the full system check**

Run:

```bash
bun run system-check
```

Expected: exits 0 (lint, typecheck, all jest tests pass).

- [ ] **Step 2.6: Commit**

```bash
git add src/data/genreFilters.ts src/data/genreFilters.test.ts
git commit -m "$(cat <<'EOF'
KSN: add `genreFilters` catalog + `splitHiddenForAniList` helper

- 28 entries split across `genre` and `tag` kinds
- pure helper sorts and routes ids into `genreNotIn` / `tagNotIn`
- tests cover empty, single, mixed, order-stability, unknown-id
EOF
)"
```

---

## Task 3: Persist `preferences` store + add `hiddenGenres`

**Files:**
- Modify: `src/state/preferences.ts`

- [ ] **Step 3.1: Replace the store with a persisted version**

Replace the entire contents of `src/state/preferences.ts` with:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type State = {
  japanese: boolean;
  toggleJapanese: () => void;

  hiddenGenres: string[];
  toggleHiddenGenre: (id: string) => void;
};

export const usePreferences = create<State>()(
  persist(
    (set) => ({
      japanese: false,
      toggleJapanese: () => set((s) => ({ japanese: !s.japanese })),

      hiddenGenres: ['ecchi'],
      toggleHiddenGenre: (id) =>
        set((s) => ({
          hiddenGenres: s.hiddenGenres.includes(id)
            ? s.hiddenGenres.filter((x) => x !== id)
            : [...s.hiddenGenres, id],
        })),
    }),
    {
      name: 'kasane-preferences',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        japanese: s.japanese,
        hiddenGenres: s.hiddenGenres,
      }),
    }
  )
);
```

Notes for the implementer:
- `createJSONStorage(() => AsyncStorage)` is the official zustand pattern for RN. AsyncStorage's web shim uses `localStorage`, so this also works in the browser export.
- `partialize` excludes the action functions from the persisted payload.
- `version: 1` is the seed for future migrations; no `migrate` function needed yet.

- [ ] **Step 3.2: Typecheck**

Run:

```bash
bun run typecheck
```

Expected: exits 0.

- [ ] **Step 3.3: Run system-check**

Run:

```bash
bun run system-check
```

Expected: exits 0.

- [ ] **Step 3.4: Commit**

```bash
git add src/state/preferences.ts
git commit -m "$(cat <<'EOF'
KSN: persist `preferences` store + add `hiddenGenres`

- wrap `usePreferences` in zustand `persist` middleware backed by `AsyncStorage`
- new `hiddenGenres: string[]` (default `['ecchi']`) + `toggleHiddenGenre(id)`
- `partialize` strips actions from the persisted payload
- persist key `kasane-preferences`, version `1`
EOF
)"
```

---

## Task 4: Add `tag_not_in` to AniList queries

**Files:**
- Modify: `src/api/anilist.ts:42-65` (both search queries), `src/api/anilist.ts:67-82` (latest), `src/api/anilist.ts:120-146` (exported functions)

- [ ] **Step 4.1: Add `$tagNotIn` to all three queries**

In `src/api/anilist.ts`, replace `SEARCH_TYPED_QUERY`, `SEARCH_ANY_QUERY`, and `LATEST_ANIME_QUERY` with these:

```ts
const SEARCH_TYPED_QUERY = gql`
  query Search($query: String!, $type: MediaType!, $genreNotIn: [String], $tagNotIn: [String]) {
    Page(perPage: 20) {
      media(
        search: $query
        type: $type
        sort: SEARCH_MATCH
        genre_not_in: $genreNotIn
        tag_not_in: $tagNotIn
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const SEARCH_ANY_QUERY = gql`
  query Search($query: String!, $genreNotIn: [String], $tagNotIn: [String]) {
    Page(perPage: 20) {
      media(
        search: $query
        sort: SEARCH_MATCH
        genre_not_in: $genreNotIn
        tag_not_in: $tagNotIn
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const LATEST_ANIME_QUERY = gql`
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
      ) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;
```

- [ ] **Step 4.2: Update `searchMedia` and `getLatestAnime` signatures**

In `src/api/anilist.ts`, replace the existing `searchMedia` and `getLatestAnime` exports with:

```ts
export async function searchMedia(
  query: string,
  type?: MediaType,
  genreNotIn?: string[] | null,
  tagNotIn?: string[] | null
): Promise<AniListMedia[]> {
  if (!query.trim()) return [];
  const data = type
    ? await client.request<{ Page: { media: AniListMedia[] } }>(
        SEARCH_TYPED_QUERY,
        {
          query,
          type,
          genreNotIn: genreNotIn ?? null,
          tagNotIn: tagNotIn ?? null,
        }
      )
    : await client.request<{ Page: { media: AniListMedia[] } }>(
        SEARCH_ANY_QUERY,
        {
          query,
          genreNotIn: genreNotIn ?? null,
          tagNotIn: tagNotIn ?? null,
        }
      );
  return data.Page.media;
}

export async function getLatestAnime(
  genreNotIn?: string[] | null,
  tagNotIn?: string[] | null
): Promise<AniListMedia[]> {
  const data = await client.request<{ Page: { media: AniListMedia[] } }>(
    LATEST_ANIME_QUERY,
    {
      genreNotIn: genreNotIn ?? null,
      tagNotIn: tagNotIn ?? null,
    }
  );
  return data.Page.media.filter(isFranchiseRoot);
}
```

- [ ] **Step 4.3: Typecheck**

Run:

```bash
bun run typecheck
```

Expected: exits 0. (Existing call sites in `app/index.tsx` still work because both new parameters are optional.)

- [ ] **Step 4.4: Run system-check**

Run:

```bash
bun run system-check
```

Expected: exits 0.

- [ ] **Step 4.5: Commit**

```bash
git add src/api/anilist.ts
git commit -m "$(cat <<'EOF'
KSN: add `tag_not_in` to AniList queries

- `SEARCH_TYPED_QUERY`, `SEARCH_ANY_QUERY`, `LATEST_ANIME_QUERY` accept `$tagNotIn`
- new optional `tagNotIn` parameter on `searchMedia` and `getLatestAnime`
- defaults to `null` (AniList ignores null filters)
EOF
)"
```

---

## Task 5: Replace home-screen ecchi toggle with full chip catalog

**Files:**
- Modify: `app/index.tsx:41-66` (state + queries), `app/index.tsx:89-98` (chip row), `app/index.tsx:275-289` (styles)

- [ ] **Step 5.1: Update imports**

In `app/index.tsx`, add these imports near the existing imports (keep the existing import order — alphabetical within each group):

```ts
import { GENRE_FILTERS, splitHiddenForAniList } from '@/data/genreFilters';
```

- [ ] **Step 5.2: Replace local `hideEcchi` state with persisted `hiddenGenres`**

In `app/index.tsx`, inside `HomeScreen`:

Remove these lines:

```ts
const [hideEcchi, setHideEcchi] = useState(true);
```

…and:

```ts
const genreNotIn = hideEcchi ? ['Ecchi'] : null;
```

Add these in their place (just below `const [type, setType] = useState<MediaType | undefined>(undefined);`):

```ts
const hiddenGenres = usePreferences((s) => s.hiddenGenres);
const toggleHiddenGenre = usePreferences((s) => s.toggleHiddenGenre);
const { genreNotIn, tagNotIn } = splitHiddenForAniList(hiddenGenres);
```

- [ ] **Step 5.3: Wire `tagNotIn` into the two `useQuery` hooks**

Replace the existing search query call with:

```ts
const { data: searchResults, isFetching, error } = useQuery({
  queryKey: ['search', debouncedQuery, type, genreNotIn, tagNotIn],
  queryFn: () => searchMedia(debouncedQuery, type, genreNotIn, tagNotIn),
  enabled: isSearching,
});
```

Replace the existing latest-anime query call with:

```ts
const { data: latestAnime, isFetching: latestFetching } = useQuery({
  queryKey: ['latest-anime', genreNotIn, tagNotIn],
  queryFn: () => getLatestAnime(genreNotIn, tagNotIn),
  enabled: !isSearching,
  staleTime: 60 * 60 * 1000,
});
```

- [ ] **Step 5.4: Replace the single ecchi chip with the full chip row**

In `app/index.tsx`, find the existing block:

```tsx
<View style={styles.filters}>
  <Pressable
    onPress={() => setHideEcchi((v) => !v)}
    style={[styles.filterChip, hideEcchi && styles.filterChipActive]}
  >
    <Text style={[styles.filterText, hideEcchi && styles.filterTextActive]}>
      Hide ecchi
    </Text>
  </Pressable>
</View>
```

Replace it with:

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

- [ ] **Step 5.5: Add the `genreFilters` style**

In the `StyleSheet.create({...})` block at the bottom of `app/index.tsx`, add (just below the existing `filters:` entry):

```ts
genreFilters: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  rowGap: 8,
},
```

(Do **not** add any `margin`. Per repo CLAUDE.md, spacing comes from `gap` + `padding` only.)

- [ ] **Step 5.6: Remove the now-unused `useState` import if it's no longer needed**

Check the import line for `'react'`. `useState` is still used (for `query`, `debouncedQuery`, `type`), so the import stays. No change needed — just confirm.

- [ ] **Step 5.7: Typecheck**

Run:

```bash
bun run typecheck
```

Expected: exits 0.

- [ ] **Step 5.8: Run system-check**

Run:

```bash
bun run system-check
```

Expected: exits 0 (no eslint regressions, no test regressions).

- [ ] **Step 5.9: Manual browser verification**

Run:

```bash
bun run web
```

In the browser at the opened URL:

1. Confirm a wrapping chip row appears below the search box.
2. Confirm `× Ecchi` shows as active (purple background) on a fresh storage (e.g. private window).
3. Tap `× Ecchi` — chip becomes inactive; the latest-anime grid re-fetches and may show different results.
4. Tap `Isekai` — chip becomes active (`× Isekai`); the grid re-fetches; isekai shows are excluded.
5. Reload the page — selections persist.
6. Type a search query — confirm chips remain visible and apply to search results.
7. Open devtools → Application → Local Storage → confirm key `kasane-preferences` contains `hiddenGenres` and `japanese`.

Stop the dev server (Ctrl+C) when done.

- [ ] **Step 5.10: Commit**

```bash
git add app/index.tsx
git commit -m "$(cat <<'EOF'
KSN: replace ecchi toggle with full genre chip row

- wrapping `genreFilters` row renders all 28 `GENRE_FILTERS`
- chips persist via `hiddenGenres` in `usePreferences`
- queries gain `tagNotIn` alongside `genreNotIn`
- removes local `hideEcchi` `useState`
EOF
)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Filter catalog (28 entries, genre vs tag) — Task 2.
- ✅ `splitHiddenForAniList` helper — Task 2.
- ✅ Persisted `hiddenGenres` in `preferences` with `ecchi` default — Task 3.
- ✅ `japanese` retrofitted onto same persisted store — Task 3.
- ✅ `tag_not_in` added to all three AniList queries and both exported functions — Task 4.
- ✅ Chip row replaces ecchi toggle, always visible, wraps — Task 5.
- ✅ Sorted ids so cache keys are stable — `splitHiddenForAniList` sorts internally (Task 2).
- ✅ AsyncStorage dep — Task 1.

**Placeholder scan:** No `TBD`/`TODO`/"similar to" — every step has the full code.

**Type/name consistency:**
- `GenreFilter` type, `GenreFilterKind`, `GENRE_FILTERS`, `SplitFilters`, `splitHiddenForAniList` — same names used in Tasks 2, 5.
- `hiddenGenres` / `toggleHiddenGenre` — defined Task 3, consumed Task 5.
- `genreNotIn` / `tagNotIn` — produced by helper Task 2, consumed by API Task 4, wired in Task 5.

**Repo conventions:**
- All new types use `type`, not `interface`. ✅
- No `any`. ✅
- No `margin` added. ✅
- One commit per task. ✅
- Subjects prefixed `KSN:`. ✅
- No agent attribution trailers. ✅

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-28-genre-filters.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.
