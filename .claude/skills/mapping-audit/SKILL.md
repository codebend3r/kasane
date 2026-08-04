---
name: mapping-audit
description: Use when checking kasane's catalog for bad arc mappings — after inserting or editing a series in Supabase, before cutting a release, when a user reports an episode pointing at the wrong chapter, or when asked to "audit the catalog", "check the mappings", or "find bad data".
---

# Mapping Audit

Arc mappings are hand-researched and written straight into Supabase. They pass through no code review, no CI, and no migration. A mistyped boundary ships to every client on next launch. This audit is the only gate between a typo and production.

## Run it

```bash
bun run scripts/audit-mappings.ts               # structural checks, triaged findings hidden
bun run scripts/audit-mappings.ts --errors-only # the actionable backlog
bun run scripts/audit-mappings.ts --series "One Piece"
bun run scripts/audit-mappings.ts --anilist     # + AniList count cross-check (slow, rate-limited)
bun run scripts/audit-mappings.ts --json        # for programmatic consumers
bun run scripts/audit-mappings.ts --no-ignore   # include findings already triaged as intentional
```

Exit code is 1 when any `error` survives, so it composes into a release gate.

## What each code means

| Code                                                                     | Severity                                 | Meaning                                                                                                        |
| ------------------------------------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `chapter-overlap` / `episode-overlap`                                    | error                                    | Consecutive arcs claim the same unit. Two arcs answer one lookup and `find` returns the earlier one.           |
| `episode-null-sandwich`                                                  | error                                    | An arc with episodes follows one without. Null episodes are only valid on the unadapted tail.                  |
| `position-sequence`                                                      | error                                    | Positions are not a dense 0-based run, so display order is undefined.                                          |
| `chapter-range-inverted`, `episode-range-inverted`, `non-positive-index` | error                                    | Impossible range. Always a typo.                                                                               |
| `catalog-behind-anime`                                                   | error                                    | Arcs stop short of the episode count AniList reports for the mapped id alone.                                  |
| `chapter-gap` / `episode-gap`                                            | warn if the hole is 1-3 units, else info | Small holes are off-by-one typos; long runs are anime filler or deliberately skipped stretches.                |
| `season-partial`                                                         | warn                                     | Some adapted arcs carry `season`, some do not. Per-season coverage UI needs all or none.                       |
| `movie-*`                                                                | warn                                     | A film's chapter range or `after_episode` falls outside the mapped arcs.                                       |
| `catalog-behind-manga`                                                   | warn                                     | The manga has published past the last mapped arc. Feed this to `mapping-correction`.                           |
| `shared-manga-id`                                                        | info                                     | Two series share a manga id. The lowest series id wins the lookup. Confirm the winner is the one users expect. |

## Triage before fixing

**Not every finding is a bug.** These modelling choices produce findings legitimately:

- **Light-novel adaptations** store LN _volume_ numbers in the chapter columns, so ranges overlap and skip freely.
- **Anime-original arcs** woven mid-stream share a boundary chapter with the arc around them.
- **Non-linear adaptations** (a season that backfills chapters an earlier season skipped) genuinely overlap.
- **Deliberately partial mappings** of very long shows leave large gaps on purpose.

Confirm the intent from the arc name, the `note`, or `source_notes` before touching data. When a finding is intentional, record it in `scripts/audit-ignore.json` with a reason:

```json
"Toilet-bound Hanako-kun": {
  "chapter-overlap": "S1 skipped chapters 23-29 and S2 backfilled them, so the season ranges genuinely overlap"
}
```

Suppression is per series + code, so a new bug of an already-triaged code in an already-triaged series stays hidden. **Re-run with `--no-ignore` whenever you edit a series that has an entry there.**

## Fixing what is real

Corrections are Supabase writes, not code changes. Use the `mapping-correction` skill. Never edit rows to silence the audit without confirming the underlying fact against the fandom wiki or Wikipedia first.

## Common mistakes

| Mistake                                             | Why it hurts                                                                                                                                                   |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adding an ignore entry to make the output green     | The audit exists to be believed. An unjustified entry makes every future run less trustworthy.                                                                 |
| Treating every `chapter-gap` as a bug               | Most long gaps are anime filler. Fix the 1-3 unit ones first.                                                                                                  |
| Comparing max episode to AniList `episodes` by hand | This catalog stores **cumulative** episodes across seasons; AniList reports one season. Only a shortfall is signal, which is what `--anilist` already encodes. |
| Editing rows with the app's publishable key         | Catalog tables are read-only under RLS. Write via Supabase MCP, the dashboard, or a service-role script.                                                       |
