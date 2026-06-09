# anime-manga-guide — Design

**Date:** 2026-05-12
**Status:** Initial design

## Purpose

Help users align anime episodes with manga chapters so they can:

1. **Manga reader** — check if an anime exists for a series, and how far through the manga it covers.
2. **Anime viewer** — figure out which manga volume(s) to buy to continue where the anime left off.
3. **Cross-media reader** — use a chapter↔episode guide to follow both in lockstep.

## Scope (initial version)

- Search anime or manga by title.
- View a detail page showing a visual **chapter↔episode rail** with two parallel timelines aligned by mapping.
- Three quick-answer flows for the three personas above ("I just finished episode N → start at chapter M", and inverse).
- Seed mapping data for ~5 popular series, loaded from a bundled JSON.

Out of scope: user accounts, sync, ratings, watch-tracking, light-novel mapping, official partnerships with publishers.

## Tech Stack

| Layer           | Choice                                     | Why                                                                                                 |
| --------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Core framework  | **Expo (React Native + React Native Web)** | One codebase for iOS, Android, Web. Mature, huge ecosystem.                                         |
| Routing         | **Expo Router** (file-based)               | Universal routes that work on native + web.                                                         |
| Language        | **TypeScript**                             | Type safety across boundaries.                                                                      |
| Desktop wrapper | **Tauri 2**                                | Wraps the Expo web export for macOS/Windows/Linux. Smaller and faster than Electron.                |
| Data fetching   | **TanStack Query**                         | Caching, request dedupe, offline-friendly.                                                          |
| Local state     | **Zustand**                                | Lightweight, no boilerplate.                                                                        |
| Anime/manga API | **AniList GraphQL**                        | Free, no auth needed, rich data (covers, chapter counts, descriptions).                             |
| Mapping data    | **Bundled JSON in `src/data/mappings/`**   | No clean public API exists for episode↔chapter mapping. Versioned in-repo, community-contributable. |

### Why this stack over alternatives

- **vs. Flutter:** Flutter genuinely covers all platforms, but Dart is less ubiquitous and the desktop story is less polished than Tauri. Expo + Tauri keeps everything in TS/JS.
- **vs. Tauri-only (with Tauri mobile):** Tauri mobile is newer/less mature than Expo's mobile pipeline. We prefer Expo for the screens users spend most time on.
- **vs. Electron for desktop:** Tauri produces ~3-10MB binaries vs. Electron's ~150MB+, with better native feel.

## Architecture

```
anime-manga-guide/
├── app/                       # Expo Router routes (file-based)
│   ├── _layout.tsx            # Root layout: QueryClientProvider, SafeAreaProvider
│   ├── index.tsx              # Home / search screen
│   └── series/[id].tsx        # Detail screen with rail
├── src/
│   ├── api/
│   │   └── anilist.ts         # GraphQL client, search + getSeries queries
│   ├── components/
│   │   ├── SeriesCard.tsx     # Search result tile
│   │   └── EpisodeChapterRail.tsx  # The core visual
│   ├── data/
│   │   └── mappings/          # JSON files, one per series
│   │       └── one-piece.json
│   └── types/
│       └── index.ts           # Series, Mapping, Episode, Chapter types
├── src-tauri/                 # Tauri 2 desktop wrapper (added after web bundle works)
├── assets/                    # icons, splash
└── docs/superpowers/specs/    # this spec
```

### Data Flow

1. User searches → AniList GraphQL `Page(media: ...)` query → results list.
2. User taps a series → fetch series detail + look up local mapping JSON by AniList ID.
3. `EpisodeChapterRail` renders two parallel scrollable rails. Each rail is a list of bars sized to relative length. Mapping entries draw connector ribbons between aligned episodes and chapters.

### Mapping Schema

```json
{
  "anilistAnimeId": 21,
  "anilistMangaId": 30013,
  "title": "One Piece",
  "mappings": [
    { "episodes": [1, 1], "chapters": [1, 7], "arc": "Romance Dawn" },
    { "episodes": [2, 3], "chapters": [8, 21], "arc": "Orange Town" }
  ],
  "sourceNotes": "Manually curated from arc summaries on the wiki."
}
```

Episode/chapter ranges are inclusive. An "arc" label groups related entries.

## Error Handling

- API failure → friendly empty state with retry button (TanStack Query retry).
- No mapping for series → show "Mapping not available yet — contributions welcome" with a link to the repo's mappings folder.
- Offline → TanStack Query serves cached data; mapping JSON is bundled so always available.

## Testing

- Unit tests for mapping lookup + range arithmetic with **Jest + jest-expo preset**.
- Snapshot tests for `EpisodeChapterRail` (web variant) to catch layout regressions.
- Manual smoke test matrix: iOS sim, Android emulator, web, macOS Tauri build.

## Distribution

| Platform                | Channel                                          | Requires                           |
| ----------------------- | ------------------------------------------------ | ---------------------------------- |
| iOS                     | App Store via EAS Build                          | Apple Developer Program ($99/yr)   |
| Android                 | Play Store via EAS Build                         | Google Play Console ($25 one-time) |
| Web                     | Static hosting (Netlify/Vercel/Cloudflare Pages) | nothing                            |
| macOS / Windows / Linux | Tauri-built binaries, GitHub Releases            | nothing (code signing optional)    |

## Open Questions

- Mapping data sourcing: do we manually curate, scrape wikis (legal grey area), or accept community PRs only? Initial answer: curate a few popular series manually, accept PRs.
- Monetization: unaddressed in v1.
