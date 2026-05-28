# Arcs-behind indicator

## Goal

On a series detail page, surface how many manga arcs the anime adaptation has not yet reached. The indicator lives near the Episode ↔ Chapter rail.

## Data model

`MappingEntry.episodes` becomes optional. An entry without `episodes` represents an unadapted manga arc (chapter range and arc name only).

```ts
type MappingEntry = {
  episodes?: [number, number];
  chapters: [number, number];
  arc?: string;
  season?: number;
  note?: string;
};
```

Unadapted entries are appended to the same `mappings` array. No new top-level field on `SeriesMapping`.

Example JSON:

```json
{ "chapters": [218, 302], "arc": "Skypiea" }
```

## Rail behavior (`EpisodeChapterRail`)

- **Top row (episodes)**: filter to entries with `episodes`. Unchanged visually.
- **Bottom row (chapters)**: render all entries (adapted + unadapted).
  - Adapted entries: existing colored bars.
  - Unadapted entries: muted bars (desaturated bg, dimmer text) so they read as "not yet animated."
- **Grey tail bar**: when the mapping has ≥1 unadapted entry, suppress the existing `showTail` fallback. The named unadapted bars replace it. When 0 unadapted entries exist, preserve current grey-tail behavior.

## Indicator

Small uppercase tag rendered **above** the rail, inline with the "Episode ↔ Chapter map" section title.

- Label: `N ARCS BEHIND` (e.g., `3 ARCS BEHIND`).
- Only rendered when count > 0.
- Count = number of entries in `mapping.mappings` with no `episodes`.
- Styling: same dimensions/letter-spacing as the existing badges (e.g., `MAPPED`, `AUTO-ESTIMATED`), muted background.

## `SeasonCoverage`

Filter out entries with no `episodes` before bucketing — they carry no season/episode info.

## Seed data

Add unadapted arcs to `one-piece.json` only. Other mappings remain unchanged.

The existing One Piece mapping covers through Alabasta. Append known post-Alabasta arcs as unadapted entries (chapter ranges + arc names, no `episodes`). The badge will reflect the number of appended arcs.

## Files touched

- `src/types/index.ts` — `episodes` optional.
- `src/components/EpisodeChapterRail.tsx` — muted bars, suppress grey tail when unadapted entries exist.
- `src/components/SeasonCoverage.tsx` — filter unadapted entries.
- `app/series/[id]/index.tsx` — render `N ARCS BEHIND` tag inline with section title.
- `src/data/mappings/one-piece.json` — seed unadapted arcs.

## Out of scope

- Per-series curation of unadapted arcs beyond One Piece.
- Driving the count from live AniList episode counts (e.g., to handle a mapping whose adapted entries are outdated).
- Surfacing the indicator on `SeriesCard` or the series header badge row.
