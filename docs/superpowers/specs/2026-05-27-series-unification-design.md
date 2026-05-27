# series-unification — Design

**Date:** 2026-05-27
**Status:** Initial design — Phase 1 in scope

## Purpose

Merge separate anime and manga results/routes into a single "series" entity. One result per franchise in search and the home grid, one canonical detail route at `/series/[id]`, with a tri-state badge indicating which adaptations exist.

## Phases

- **Phase 1 (this spec):** Build `/series/[id]` and `/series/[id]/arc/[arcIdx]`. Switch search results and the home grid to route there. Leave `/anime/` and `/manga/` directories in place so existing deep links keep working until verification.
- **Phase 2 (separate task):** Delete `app/anime/` and `app/manga/`.

## ID resolution

`routeId` for a series:
- If a manga exists in the pair → manga's AniList ID.
- Else (anime-original) → anime's AniList ID.

Example: One-Punch Man (`manga 74347`, anime `21087`) → `/series/74347`. Code Geass (anime-original) → `/series/<anime_id>`.

The `/series/[id]` page accepts either a manga ID or an anime ID. If an anime ID is provided but the anime has a manga `SOURCE` relation, the page silently treats the manga as primary (no redirect — same content either way).

## Data shape

New type in `src/types/index.ts`:

```ts
export type SeriesBadge = 'both' | 'manga-only' | 'anime-only';

export type SeriesEntry = {
  routeId: number;
  primary: AniListMedia;
  anime: AniListMedia | null;
  manga: AniListMedia | null;
  badge: SeriesBadge;
};
```

`primary` is the media used for cover/title/description on cards — manga when present, otherwise anime.

## Pairing logic — `pairResults`

Add to `src/data/index.ts`:

```ts
export function pairResults(media: AniListMedia[]): SeriesEntry[]
```

Algorithm:
1. Build `byId = Map<id, AniListMedia>` from input.
2. For each manga in input, find anime adapters: collect IDs from its `relations.edges` where `relationType === 'ADAPTATION'` and `node.type === 'ANIME'`. Also collect `relationType === 'SOURCE'` reverse links (anime whose source is this manga, when iterating from the anime side).
3. For each anime in input, find its source manga: `relations.edges` where `relationType === 'SOURCE'` and `node.type === 'MANGA'`.
4. Drop anime entries whose source manga is also in the input — they're absorbed by the manga's `SeriesEntry`.
5. Build entries:
   - **Manga in input** → entry with `manga = media`, `anime = byId.get(adapterAnimeId) ?? null`, `primary = manga`, badge `both` if any adapter anime exists in input *or* in relations, else `manga-only`.
   - **Anime in input** (not absorbed) → entry with `anime = media`, `manga = byId.get(sourceMangaId) ?? null`, `primary = manga ?? anime`, badge `both` if a manga source exists in relations (even if not in input), `routeId = manga?.id ?? anime.id`, else `anime-only`.
6. Preserve input order by first occurrence.

## Routes

### `app/series/[id]/index.tsx`

Loads `media = getMedia(id)`. Branches:

- `media.type === 'MANGA'`:
  - `manga = media`
  - Determine `anime`: prefer curated mapping's `anilistAnimeId`; else find first `relations.edges` with `relationType === 'ADAPTATION'` + `node.type === 'ANIME'`. Fetch via `getMedia(animeId)`.
- `media.type === 'ANIME'`:
  - `anime = media`
  - Determine `manga`: prefer curated mapping's `anilistMangaId`; else find first `relations.edges` with `relationType === 'SOURCE'` + `node.type === 'MANGA'`. Fetch via `getMedia(mangaId)`.

`partnerMedia` is fetched in parallel via TanStack Query. MangaDex lookup uses `manga.id` and `manga.title.english ?? manga.title.romaji`.

Header rendering (table from brainstorm):

| Section | Both | Manga-only | Anime-only |
|---|---|---|---|
| Cover | manga | manga | anime |
| Title + native | manga | manga | anime |
| Subtitle | `{ch} ch · {vol} vol · {eps} eps · {format} · {date}` | `{ch} ch · {vol} vol · {format} · {status}` | `{eps} eps · {format} · {date}` |
| Description | manga | manga | anime |
| Badges | `ANIME + MANGA` + optional `MAPPED` | `MANGA ONLY` + optional `MAPPED` | `ANIME ONLY` + optional `MAPPED` |

Body sections (rendered in order when applicable):
- Optional auto-estimated banner (synthetic mapping)
- `EpisodeChapterRail` with `totalChapters` (MangaDex when manga exists, else null)
- `SeasonCoverage` (curated mapping only)
- `QuickLookup`
- MangaDex `VolumesGrid` (when manga exists)
- Titles & translations table (when MangaDex has multiple)
- Sources footer

### `app/series/[id]/arc/[arcIdx].tsx`

Identical to existing `app/anime/[id]/arc/[arcIdx].tsx` and `app/manga/[id]/arc/[arcIdx].tsx` — looks up mapping via `findMappingByMediaId`, renders `<ArcDetailView />`.

## Component updates

### `EpisodeChapterRail`

Change `routePrefix: 'anime' | 'manga'` to `routePrefix: 'series'`. Arc navigation pushes `/series/[id]/arc/[arcIdx]`.

Old `/anime/[id]` and `/manga/[id]` pages continue to pass `routePrefix="series"` until Phase 2 deletes them, meaning their internal arc links also start routing to `/series/[id]/arc/[arcIdx]`. This is intentional — keeps the rail consistent during the transition.

### `SeriesCard`

Signature change: `media: AniListMedia` → `entry: SeriesEntry`. Renders:
- Cover from `primary.coverImage.large`
- Title from `primary.title.english ?? primary.title.romaji`
- Length label: if both, show `{eps} eps · {ch} ch`; else show the side that exists.
- New badge from `entry.badge`. MAPPED badge unchanged (orthogonal).
- Link href uses `routeId` → `/series/[id]`.

### Home screen (`app/index.tsx`)

- Search list: feed `searchResults` through `pairResults` before rendering. `SeriesCard` consumes the resulting entries.
- Latest-anime grid: continue using `getLatestAnime` (anime-only). For each result, derive `SeriesEntry` (most will be `both` because they have manga sources). Grid item links via `routeId`. Add small badge overlay on the cover.

## Edge cases

- **Anime in input has manga source not in input (search returned only anime)** — keep the anime entry visible, badge `both`, `routeId = sourceMangaId`. The card cover/title still use the anime since the manga wasn't fetched.
- **Manga with multiple anime adaptations (OPM has S1/S2/S3)** — collapses to one card. The detail page fetches the curated mapping's `anilistAnimeId` (S1) for the anime side.
- **Anime-original** (no `SOURCE` relation to manga) — badge `anime-only`, `routeId = anime.id`.
- **Manga with no anime adaptation** — badge `manga-only`, `routeId = manga.id`.
- **No curated mapping, no synthetic mapping** — page still renders header + badge + description. No rail.

## Testing (manual)

- `/series/74347` (OPM): badge ANIME+MANGA + MAPPED, manga cover, 36 eps + chapters subtitle, rail with tail.
- `/series/21087` (OPM via anime ID): same content as above (page resolves manga as primary).
- `/series/<Berserk manga id>`: ANIME+MANGA + MAPPED, multiple anime adaptations exist, page picks one via mapping.
- `/series/<anime-original id>`: ANIME ONLY badge, anime cover.
- Home grid: badges visible on each grid item, click goes to `/series/[id]`.
- Search "One Punch Man": one card returned (manga 74347), not three.
- Old routes `/anime/21087` and `/manga/74347` still load (Phase 2 deletes them).

## Out of scope (Phase 1)

- Deleting `app/anime/` and `app/manga/`
- Cross-library "how far behind" overview screen
- Per-card progress percentages
- Filter chips on home (All/Anime/Manga) — keep as-is for now; may revisit once unified entries are the default
