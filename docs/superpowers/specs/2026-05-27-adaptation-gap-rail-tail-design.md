# adaptation-gap-rail-tail — Design

**Date:** 2026-05-27
**Status:** Initial design

## Purpose

Give users a visual reference for **how far behind the anime is from the manga** — i.e., the manga chapters that have not yet been adapted into anime episodes.

## Scope

- Extend `EpisodeChapterRail` so the manga-chapters rail can render a dimmed "not yet adapted" tail segment after the last mapped chapter.
- Show this tail on both the anime detail page and the manga detail page (both already render the rail).
- Source of total chapter count:
  - **Anime detail page** — partner manga's `chapters` field from `media.relations.edges` (already fetched by `DETAIL_QUERY`; same lookup pattern as `buildSyntheticMapping`).
  - **Manga detail page** — `mangadex?.chapters ?? media.chapters` (already used for the header subtitle).

Out of scope: cross-library overview screen, per-card progress badges, fetching MangaDex on the anime page for fresher counts, manual override field in mapping JSONs.

## Component change

`EpisodeChapterRail` gains one optional prop:

```ts
totalChapters?: number | null
```

Render rules (chapter rail only — episode rail unchanged):

- If `totalChapters` is null/undefined → no tail.
- Let `maxCovered = Math.max(...mapping.mappings.map(m => m.chapters[1]))`.
- If `totalChapters <= maxCovered` → no tail (anime caught up or surpassed; e.g., FMAB, Frieren).
- Otherwise append a non-interactive bar after the colored arc bars:
  - `flex = totalChapters - maxCovered`
  - Background `#2a2a2a`, text color `#9aa0a6`
  - Label `{maxCovered + 1}–{totalChapters}`
  - No `onPress`, not in tab order.

The episode rail above stays as-is; this is a chapter-side feature only.

## Callers

### `app/anime/[id]/index.tsx`

Derive the partner manga's chapter total from the anime media's relations:

```ts
const partnerMangaChapters = useMemo(() => {
  const edges = media?.relations?.edges ?? [];
  const partner = edges.find(
    (e) =>
      (e.relationType === 'SOURCE' || e.relationType === 'ADAPTATION') &&
      e.node.type === 'MANGA' &&
      typeof e.node.chapters === 'number'
  );
  return partner?.node.chapters ?? null;
}, [media]);
```

Pass `totalChapters={partnerMangaChapters}` to the rail.

### `app/manga/[id]/index.tsx`

Already computes `totalChapters` for the header subtitle as `mangadex?.chapters ?? media.chapters ?? null`. Reuse that value and pass `totalChapters={totalChapters}` to the rail.

## Edge cases

- **Unknown total** (AniList missing `chapters` on the related manga node, or MangaDex unavailable) → no tail. Acceptable degradation.
- **Anime ahead of manga** (rare; e.g., FMAB anime ran past published manga) → mapping's `maxCovered` exceeds `totalChapters` → no tail.
- **Ongoing manga with stale count** → tail rendered with whatever count was returned. No `+` suffix in v1 — keep label simple.
- **Synthetic mappings** (no curated JSON) — `buildSyntheticMapping` sets `chapters: [1, totalChapters]`, so `maxCovered === totalChapters` → no tail. Correct: synthetic mappings already span the full known manga.

## Testing

- Manual smoke test on `/anime/21087` (One-Punch Man) — expect dimmed `117–<N>` tail on the chapter rail.
- Spot-check `/anime/<FMAB id>` — expect no tail (anime covers full manga).
- Spot-check `/manga/<OPM manga id>` — expect tail matching the anime page.

No new unit tests; the change is presentational and rides on the existing rail rendering.
