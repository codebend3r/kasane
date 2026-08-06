---
name: domain-tests
description: Use when adding or changing logic in kasane's `src/data/`, `src/state/`, or `src/api/` layers, or when asked to add test coverage, write unit tests, or verify pure functions in this repo.
---

# Domain Tests

kasane's whole product claim is that episode N maps to chapters X-Y. The functions that decide that live in `src/data/index.ts` and **have no tests**. Everything else is presentation.

**REQUIRED BACKGROUND:** `superpowers:test-driven-development` for the RED-GREEN cycle. This skill covers the repo-specific conventions and the untested surface.

## The convention

`src/state/syncMerge.test.ts` is the reference. Match it:

- Colocate as `<module>.test.ts` next to the source. Tests run on `bun test` (`bun run test`); `@/` resolves to `src/`. Import `describe`/`it`/`expect` (and `mock`/`spyOn`) from `bun:test` in every test file.
- Native-only modules (`react-native`, AsyncStorage, `expo-linking`) and `@/api/supabase` are mocked globally in the preload `test/setup.ts` — bun has no `jest.mock` hoisting and runs every test file in one process, so module mocks are shared, not per-file. Drive the Supabase auth mocks via `@/api/supabase.mock`.
- One `describe` per exported function, `it` names stating the behaviour, not the mechanism.
- Build inputs as typed literals with an explicit type annotation, never a cast.
- Assert whole objects with `toEqual`, not field-by-field. A regression that adds a stray key should fail.
- Small named helpers for repeated construction (`const iso = (ms: number): string => new Date(ms).toISOString()`).
- No network, no `@supabase/supabase-js`, no `react-native` imports in a pure-logic test. If a module needs mocking to test, the logic is in the wrong file: extract it, the way `syncMerge.ts` was extracted out of `sync.ts`.

Repo rules apply to test files too: no `interface`, no `any`, no casts, `const` over `let`, `Array.prototype` methods over loops.

## The untested surface, in priority order

| Function                                                      | Cases that matter                                                                                                                                                                                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `episodeToChapters`                                           | Exact lower and upper boundary of an arc; an episode inside a gap between arcs; an episode past the last adapted arc; arcs with `episodes: undefined` (unadapted tail) never matching.                                           |
| `chapterToEpisodes`                                           | Same boundaries; a chapter in an unadapted arc returns `null` rather than the arc's chapters; a chapter beyond the last arc.                                                                                                     |
| `pairResults`                                                 | A manga absorbing its anime adaptation; an anime with no source manga staying `anime-only`; several anime sharing one source manga collapsing to one `routeId` and keeping the **first**; badge assignment for all three values. |
| `buildSyntheticMapping`                                       | Returns `null` with no relations, with no qualifying partner, and when either count is missing; picks the **earliest** partner by `startDate.year`; produces `[1, episodes]` to `[1, chapters]`.                                 |
| `getAnimeFranchise`, `hasAnimeSequels` (`src/api/anilist.ts`) | Franchise-root detection and cumulative `totalTvEpisodes`. Feed recorded AniList payloads as fixtures; do not hit the network.                                                                                                   |

Both lookup helpers return the **first** matching arc. Overlapping arcs therefore make a lookup silently order-dependent, which is why `mapping-audit` treats overlap as an error. A test should pin that behaviour so a future refactor to `filter` does not change answers.

## One good example

```ts
import { describe, expect, it } from "bun:test";
import { episodeToChapters } from "./index";
import type { SeriesMapping } from "@/types";

const mapping: SeriesMapping = {
  anilistAnimeId: 1,
  anilistMangaId: 2,
  title: "Test",
  mappings: [
    { episodes: [1, 12], chapters: [1, 40], arc: "First" },
    { episodes: [13, 24], chapters: [41, 80], arc: "Second" },
    { chapters: [81, 120], arc: "Unadapted tail" },
  ],
};

describe("episodeToChapters", () => {
  it("resolves the last episode of an arc to that arc's chapters", () => {
    expect(episodeToChapters(mapping, 12)).toEqual([1, 40]);
  });

  it("resolves the first episode of the next arc", () => {
    expect(episodeToChapters(mapping, 13)).toEqual([41, 80]);
  });

  it("returns null past the adapted range", () => {
    expect(episodeToChapters(mapping, 25)).toBeNull();
  });
});
```

## Common mistakes

| Mistake                                   | Fix                                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| Testing only the middle of a range        | Off-by-one lives at the boundary. Assert both ends of every arc.                             |
| Using a real catalog entry as the fixture | Catalog data changes in Supabase and would silently break the test. Build minimal literals.  |
| Mocking `supabase` to test merge logic    | The pure part already lives in `syncMerge.ts`. Test that; leave `sync.ts` to integration.    |
| `as SeriesMapping` on a partial literal   | Banned by CLAUDE.md and hides the missing fields the function reads. Build the whole object. |
| Asserting `toBeTruthy()` on a tuple       | `toEqual([41, 80])` catches a swapped pair; `toBeTruthy` does not.                           |
