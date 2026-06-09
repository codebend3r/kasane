# Arcs-behind Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show how many manga arcs the anime has not yet adapted, surfaced near the Episode ↔ Chapter rail on the series detail page.

**Architecture:** Make `MappingEntry.episodes` optional. Entries without `episodes` represent unadapted manga arcs. `EpisodeChapterRail` renders them as muted bars on the manga (bottom) row only. A small `N ARCS BEHIND` tag rendered inline with the "Episode ↔ Chapter map" section title summarizes the count.

**Tech Stack:** React Native + Expo Router, TypeScript, React. No test runner — verification is `npm run typecheck` plus an in-browser sanity check via `npm run web`.

---

## File Map

- `src/types/index.ts` — make `MappingEntry.episodes` optional.
- `src/components/SeasonCoverage.tsx` — skip entries without `episodes`.
- `src/components/EpisodeChapterRail.tsx` — split entries into adapted vs unadapted; render unadapted as muted bars; suppress generic grey tail when any unadapted entries are present.
- `app/series/[id]/index.tsx` — derive arcs-behind count, render `N ARCS BEHIND` tag inline with section title, filter unadapted entries out of `totalEpisodes` calc.
- `src/data/mappings/one-piece.json` — append one unadapted arc as a seed.

---

## Task 1: Make `MappingEntry.episodes` optional and update existing consumers

**Files:**

- Modify: `src/types/index.ts:48-54`
- Modify: `src/components/SeasonCoverage.tsx:7-15`
- Modify: `src/components/EpisodeChapterRail.tsx:31-36`, `42-63`
- Modify: `app/series/[id]/index.tsx:134-136`

This is a refactor that leaves behavior identical because no JSON file has unadapted entries yet. The next tasks add the actual rendering for them.

- [ ] **Step 1.1: Make `episodes` optional in `MappingEntry`**

In `src/types/index.ts`, replace the existing `MappingEntry` interface:

```ts
export interface MappingEntry {
  episodes?: [number, number];
  chapters: [number, number];
  arc?: string;
  season?: number;
  note?: string;
}
```

- [ ] **Step 1.2: Filter unadapted entries from `SeasonCoverage`**

In `src/components/SeasonCoverage.tsx`, change the bucket-building loop so entries with no `episodes` are skipped (they have no season/episode info):

```tsx
const seasonBuckets = useMemo(() => {
  const m = new Map<string, typeof mapping.mappings>();
  for (const entry of mapping.mappings) {
    if (!entry.episodes) continue;
    const key = entry.season ? `Season ${entry.season}` : "Other";
    if (!m.has(key)) m.set(key, []);
    m.get(key)!.push(entry);
  }
  return Array.from(m.entries());
}, [mapping]);
```

- [ ] **Step 1.3: Fix `totalEpisodes` calc in `SeriesDetail`**

In `app/series/[id]/index.tsx`, the `totalEpisodes` calc on lines 134–136 needs to ignore unadapted entries. Replace it:

```tsx
const totalEpisodes = mapping
  ? (() => {
      const eps = mapping.mappings
        .map((m) => m.episodes?.[1])
        .filter((v): v is number => typeof v === "number");
      return eps.length > 0 ? Math.max(...eps) : (anime?.episodes ?? null);
    })()
  : (anime?.episodes ?? null);
```

- [ ] **Step 1.4: Split adapted vs unadapted in `EpisodeChapterRail` (typecheck-only fix)**

In `src/components/EpisodeChapterRail.tsx`, the top "Anime episodes →" row currently iterates `mapping.mappings` and reads `m.episodes[0]`/`m.episodes[1]` unconditionally. Since `episodes` is now optional, TypeScript will flag this.

Filter the top row to only adapted entries. Replace the top-row `.map` (currently `mapping.mappings.map((m, idx) => …)` at lines ~42–63) with:

```tsx
{
  mapping.mappings
    .filter((m) => m.episodes)
    .map((m, idx) => {
      const eps = m.episodes!;
      const span = eps[1] - eps[0] + 1;
      return (
        <Pressable
          key={`ep-${idx}`}
          onPress={() => goToArc(idx)}
          style={({ hovered, pressed }: any) => [
            styles.bar,
            {
              flex: span,
              backgroundColor: COLORS[idx % COLORS.length],
              opacity: pressed ? 0.7 : hovered ? 0.9 : 1,
            },
          ]}
        >
          <Text style={styles.barText} numberOfLines={1}>
            {m.arc ?? `${eps[0]}–${eps[1]}`}
          </Text>
        </Pressable>
      );
    });
}
```

Note: `idx` here is the index in the filtered array; Task 2 fixes that so `goToArc` still receives the original index.

The bottom "Manga chapters →" row already only reads `m.chapters` — it does not need a filter change here. Task 2 will update that row's styling for unadapted entries.

The `maxCoveredChapter` calc on lines 31–33 still uses `m.chapters[1]` which is always defined — leave it as-is.

- [ ] **Step 1.5: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS (no errors).

- [ ] **Step 1.6: Commit**

```bash
git add src/types/index.ts src/components/SeasonCoverage.tsx src/components/EpisodeChapterRail.tsx app/series/[id]/index.tsx
git commit -m "$(cat <<'EOF'
KSN: make `MappingEntry.episodes` optional

- entries without `episodes` represent unadapted manga arcs
- `SeasonCoverage` skips entries with no `episodes`
- `EpisodeChapterRail` filters top row to adapted entries only
- `SeriesDetail` `totalEpisodes` calc ignores unadapted entries
EOF
)"
```

---

## Task 2: Render unadapted entries as muted bars on the manga row

**Files:**

- Modify: `src/components/EpisodeChapterRail.tsx`

Goal: on the manga (bottom) row, unadapted entries render as muted bars labeled with their arc name (or chapter range). When the mapping has ≥1 unadapted entry, the generic grey "tail" bar is suppressed because the named muted bars replace it.

- [ ] **Step 2.1: Replace the top-row filter to use original indices**

To keep `onPress={() => goToArc(idx)}` correct, switch from `.filter().map()` to `.map().filter()` style — or better, iterate with original indices. Replace the top-row block:

```tsx
{
  mapping.mappings.map((m, idx) => {
    if (!m.episodes) return null;
    const eps = m.episodes;
    const span = eps[1] - eps[0] + 1;
    return (
      <Pressable
        key={`ep-${idx}`}
        onPress={() => goToArc(idx)}
        style={({ hovered, pressed }: any) => [
          styles.bar,
          {
            flex: span,
            backgroundColor: COLORS[idx % COLORS.length],
            opacity: pressed ? 0.7 : hovered ? 0.9 : 1,
          },
        ]}
      >
        <Text style={styles.barText} numberOfLines={1}>
          {m.arc ?? `${eps[0]}–${eps[1]}`}
        </Text>
      </Pressable>
    );
  });
}
```

- [ ] **Step 2.2: Update `showTail` logic to account for unadapted entries**

Replace the `showTail` / `tailSpan` lines (~31–36) with:

```tsx
const hasUnadapted = mapping.mappings.some((m) => !m.episodes);
const maxCoveredChapter = Math.max(
  ...mapping.mappings.map((m) => m.chapters[1]),
);
const showTail =
  !hasUnadapted &&
  typeof totalChapters === "number" &&
  totalChapters > maxCoveredChapter;
const tailSpan = showTail ? totalChapters! - maxCoveredChapter : 0;
```

- [ ] **Step 2.3: Render manga-row bars with muted styling for unadapted entries**

Replace the bottom-row `.map` (currently lines ~67–87) with:

```tsx
{
  mapping.mappings.map((m, idx) => {
    const span = m.chapters[1] - m.chapters[0] + 1;
    const unadapted = !m.episodes;
    const bg = unadapted ? "#2a2a2a" : COLORS[idx % COLORS.length];
    const textStyle = unadapted ? styles.unadaptedBarText : styles.barText;
    return (
      <Pressable
        key={`ch-${idx}`}
        onPress={() => goToArc(idx)}
        style={({ hovered, pressed }: any) => [
          styles.bar,
          {
            flex: span,
            backgroundColor: bg,
            opacity: pressed ? 0.7 : hovered ? 0.9 : 1,
          },
        ]}
      >
        <Text style={textStyle} numberOfLines={1}>
          {m.arc ?? `${m.chapters[0]}–${m.chapters[1]}`}
        </Text>
      </Pressable>
    );
  });
}
```

- [ ] **Step 2.4: Add the `unadaptedBarText` style**

In the `StyleSheet.create({...})` block, add a new entry alongside `barText`:

```tsx
unadaptedBarText: {
  color: '#9aa0a6',
  fontSize: 13,
  letterSpacing: -0.2,
  fontFamily: FONT.bold,
},
```

- [ ] **Step 2.5: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 2.6: Commit**

```bash
git add src/components/EpisodeChapterRail.tsx
git commit -m "$(cat <<'EOF'
KSN: render unadapted arcs as muted bars in `EpisodeChapterRail`

- bottom row paints entries with no `episodes` in muted grey
- suppress generic tail bar when mapping has unadapted entries
- preserve original arc index for `goToArc` after introducing filter
EOF
)"
```

---

## Task 3: Render `N ARCS BEHIND` tag inline with section title

**Files:**

- Modify: `app/series/[id]/index.tsx`

- [ ] **Step 3.1: Compute the count near the other derived values**

In `app/series/[id]/index.tsx`, right after the existing `isAutoEstimated` line (around line 98), add:

```tsx
const arcsBehind = mapping
  ? mapping.mappings.filter((m) => !m.episodes).length
  : 0;
```

- [ ] **Step 3.2: Render the tag inline with the section title**

Inside the `mapping ? (...) : (...)` block (around line 215), replace the `<Text style={styles.sectionTitle}>Episode ↔ Chapter map</Text>` with a row that includes the conditional badge:

```tsx
<View style={styles.sectionTitleRow}>
  <Text style={styles.sectionTitle}>Episode ↔ Chapter map</Text>
  {arcsBehind > 0 && (
    <View style={styles.arcsBehindBadge}>
      <Text style={styles.arcsBehindText}>{arcsBehind} ARCS BEHIND</Text>
    </View>
  )}
</View>
```

- [ ] **Step 3.3: Add the row + badge styles**

In the `StyleSheet.create({...})` block, add:

```tsx
sectionTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
},
arcsBehindBadge: {
  alignSelf: 'flex-start',
  paddingHorizontal: 8,
  paddingVertical: 3,
  backgroundColor: '#2a2a2a',
  borderLeftWidth: 3,
  borderLeftColor: '#ffd65c',
},
arcsBehindText: {
  color: '#ffd65c',
  fontSize: 11,
  letterSpacing: 1.4,
  fontFamily: FONT.bold,
},
```

- [ ] **Step 3.4: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3.5: Commit**

```bash
git add app/series/[id]/index.tsx
git commit -m "$(cat <<'EOF'
KSN: add `N ARCS BEHIND` tag to Episode ↔ Chapter map header

- count derived from entries with no `episodes` in `mapping.mappings`
- inline with `sectionTitle` via new `sectionTitleRow` flex row
- hidden when count is `0`
EOF
)"
```

---

## Task 4: Seed `one-piece.json` with one unadapted arc

**Files:**

- Modify: `src/data/mappings/one-piece.json`

For an initial visible demo, append one unadapted manga arc (Elbaf — the current ongoing arc as of late-2026, not yet covered by the anime).

- [ ] **Step 4.1: Append the unadapted arc**

Replace `src/data/mappings/one-piece.json` with:

```json
{
  "anilistAnimeId": 21,
  "anilistMangaId": 30013,
  "title": "One Piece",
  "sourceNotes": "Initial seed — arc-level approximation. Refine per-episode mappings via PR.",
  "mappings": [
    { "episodes": [1, 3], "chapters": [1, 7], "arc": "Romance Dawn" },
    { "episodes": [4, 8], "chapters": [8, 21], "arc": "Orange Town" },
    { "episodes": [9, 18], "chapters": [22, 41], "arc": "Syrup Village" },
    { "episodes": [19, 30], "chapters": [42, 68], "arc": "Baratie" },
    { "episodes": [31, 47], "chapters": [69, 95], "arc": "Arlong Park" },
    { "episodes": [48, 53], "chapters": [96, 105], "arc": "Loguetown" },
    {
      "episodes": [62, 77],
      "chapters": [106, 132],
      "arc": "Whisky Peak / Little Garden"
    },
    { "episodes": [92, 130], "chapters": [155, 217], "arc": "Alabasta" },
    { "chapters": [1118, 1180], "arc": "Elbaf" }
  ]
}
```

- [ ] **Step 4.2: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4.3: Visual check**

Start the web dev server and load the One Piece series detail page:

```bash
npm run web
```

Navigate to the series page for One Piece (e.g., `/series/21` or `/series/30013`). Verify:

- `1 ARCS BEHIND` tag is visible next to "Episode ↔ Chapter map" title.
- The bottom (manga) row of the rail has a muted grey bar labeled "Elbaf" at the right end.
- The top (anime) row of the rail is unchanged.
- The previous grey "tail" bar is no longer shown.
- A non-One-Piece series with no unadapted entries (e.g., Attack on Titan) shows no badge and still shows the existing grey tail behavior as before.

- [ ] **Step 4.4: Commit**

```bash
git add src/data/mappings/one-piece.json
git commit -m "$(cat <<'EOF'
KSN: seed `one-piece.json` with `Elbaf` as unadapted arc

- demonstrates `N ARCS BEHIND` indicator and muted bar rendering
- chapter range `1118`–`1180` is approximate; refine via PR
EOF
)"
```

---

## Verification Summary

After all tasks complete:

- `npm run typecheck` → PASS
- One Piece series detail page shows `1 ARCS BEHIND` tag and a muted "Elbaf" bar on the manga row.
- Attack on Titan and other series with no unadapted entries are visually unchanged.
- `SeasonCoverage` still renders correctly for series that have it (e.g., Demon Slayer).
