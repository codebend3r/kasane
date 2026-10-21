# Changelog

All notable changes to kasane are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [1.3.4] - 2026-10-21

### Changed

- `GenreFilters` owns its own state and debounces through one hook (#40)
- Mapping and MangaDex types are tighter (#42)
- Small review cleanups (#43)

### Fixed

- Covers are keyed on the sorted id set instead of a count and sum, so different sets can no longer share a cache entry (#41)

## [1.3.3] - 2026-10-20

### Added

- Arc mappings for 45 more shows (#33)

### Changed

- One series model behind the series screen, and estimated arcs now open like curated ones (#34)
- Series stats lines are built by a pure `seriesStats` function (#36)
- Both rail lanes draw through one shared `ArcLane` (#37)
- Catalog screens share one `Page` scaffold (#38)
- Phone width is read through `useIsNarrow` everywhere (#39)

### Fixed

- Search cards no longer crawl each result's franchise, making search lighter (#35)

## [1.3.2] - 2026-10-02

### Added

- Arc mappings for 20 more shows (#31)
- `actionlint` and `typos` spellcheck in the check suite (#30)

### Changed

- One series screen, a `src/queries/` layer for every `useQuery`, and shared arc geometry (#32)

## [1.3.1] - 2026-09-18

### Changed

- Dependencies updated to latest
- Bun pinned to `1.4.2` in `package.json` and CI

## [1.3.0] - 2026-09-13

### Added

- Daily Supabase keepalive workflow
- Post-merge sanity check workflow (#29)

### Changed

- Unit tests migrated from Jest to `bun test` (#23)
- e2e runs as a separate CI job, unblocked from the linters (#26, #28)
- Workflow names standardized (#29)
- Dependencies updated to latest

### Fixed

- `bun test` harness boundaries (#27)
- Three verified catalog audit warnings triaged (#25)

## [1.2.2] - 2026-08-07

### Added

- `version-bumper` and `active-rebaser` repo skills (#22, #24)
- MIT license

### Changed

- `kasane-reviewer` agent renamed to `convention-reviewer`
- Repo agents and skills documented in `README.md`

### Fixed

- Contrast and search-input role issues from an accessibility audit (#20)
- Duplicate auto-estimate banner, no-mapping notice, and titles list (#21)

## [1.2.1] - 2026-08-06

### Added

- Side menu and a browsable catalog (#15)
- Catalog audit tooling, design tokens, Playwright e2e suite, and repo skills (#16)

### Changed

- App conventions documented in `CLAUDE.md`, with the drift they exposed fixed (#17)
- Kasane-scoped skills moved into the repo (#19)
- `README.md` brought up to date

### Fixed

- Signup redirect and a series screen crash (#15)
- `catalog-behind-anime` audit false positives (#18)

## [1.2.0] - 2026-07-18

### Added

- Arc mappings for 177 more popular shows (#11)

### Changed

- Catalog and user data migrated to Supabase (#13)

## [1.1.0] - 2026-07-12

### Added

- Supabase email/password login (#10)
- Arc mappings for 100 more shows, to 400 (#8)

### Changed

- Anime franchise totals aggregate across sequels (#9)

## [1.0.6] - 2026-07-02

### Added

- Movies on the series page, with a movie count and `movies` in the mapping schema (#4)
- Arc mappings for 196 more shows, to 300 (#5, #6, #7)

## [1.0.5] - 2026-06-09

### Added

- `bleach.json` arc mapping
- Jujutsu Kaisen S3 Part 1 (Culling Game) coverage

### Changed

- Chainsaw Man and Jujutsu Kaisen mappings reflect their finished manga
- MangaDex matching prefers the plain edition over `(Official Colored)`
- `system-check` and CI aligned on typecheck → prettier → lint → test → build

### Fixed

- Infinite render loop in `useInProgressEntries`

## [1.0.4] - 2026-06-02

### Added

- Per-series reading and watching progress, with a Continue section on the home screen
- Progress bars on `SeriesCard`
- `ProgressMarkBanner` with undo and a cross-side hint
- 12-column breakpoint at `2400px`
- Screenshots in `README.md`

### Changed

- `EpisodeChapterPie` rendered with `react-native-svg`, and the default view on mobile
- `percentAdapted` based on the mapping span rather than the tail

## [1.0.3] - 2026-05-31

### Added

- `EpisodeChapterPie` donut view, with a rail/pie toggle on the series page
- Shared `useHoverLabel` hook and `HoverLabel` popover

### Changed

- Latest Anime grid uses CSS grid with breakpoint columns

### Fixed

- Duplicate entries in paired search results

## [1.0.2] - 2026-05-30

### Changed

- Anime-only series covers get a purple outline and beveled corner
- Mobile series cover scales to viewport width
- Prose renders as semantic `<p>`
- Code style pass: no `for...of`, no interfaces, no casts, `?.` paired with `??`

### Fixed

- "No mapping" notice hidden for anime-only series

## [1.0.1] - 2026-05-30

First tagged release.

### Added

- Cross-platform Expo app for web, iOS, Android, and Tauri desktop
- Unified `/series/[id]` view pairing anime and manga, with split anime and manga routes
- Episode ↔ chapter rail with unadapted arcs, an `N ARCS BEHIND` tag, and hover popovers
- MangaDex volumes grid, latest releases, and mobile cover carousels
- Genre filter chips, with adult content always filtered
- Search aliases for compound titles and acronyms
- `Footer` with author credit and version
- Curated arc mappings for dozens of series, from One Piece to Frieren
- Netlify deploy with a MangaDex API proxy
- CI, ESLint, Jest, Prettier, and husky hooks

### Fixed

- Production MangaDex covers via `Referrer-Policy: no-referrer`

[1.3.4]: https://github.com/codebend3r/kasane/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/codebend3r/kasane/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/codebend3r/kasane/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/codebend3r/kasane/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/codebend3r/kasane/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/codebend3r/kasane/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/codebend3r/kasane/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/codebend3r/kasane/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/codebend3r/kasane/compare/v1.0.6...v1.1.0
[1.0.6]: https://github.com/codebend3r/kasane/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/codebend3r/kasane/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/codebend3r/kasane/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/codebend3r/kasane/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/codebend3r/kasane/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/codebend3r/kasane/releases/tag/v1.0.1
