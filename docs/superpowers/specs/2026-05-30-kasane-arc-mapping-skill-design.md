# Skill: `kasane-arc-mapping`

Design doc for a new user-level Claude Code skill that walks Claude through adding a curated arc mapping for a show that does not yet have one in `src/data/mappings/`.

## Purpose

The kasane repo ships curated **arc mappings** — JSON files in `src/data/mappings/` that align anime episode ranges to manga chapter ranges, named by arc. There are 38 today (`one-piece.json`, `attack-on-titan.json`, …), and the user has added one roughly every commit recently (`oshi-no-ko.json`, `my-hero-academia.json`, `mushishi.json`, `orb.json`, …).

Each new mapping is mechanically identical: look up AniList IDs and counts, research arc boundaries on the web, draft a JSON file in a specific shape, register it in `src/data/index.ts`, and commit per the [[kasane-commit-format]] skill. This skill encodes that workflow so future "map `<show>`" requests are deterministic.

## Trigger

Skill description (used by Claude to decide whether to invoke):

> Use when adding a new show's arc mapping to the kasane repo — i.e., the user asks to "map `<show>`", "add a mapping for `<show>`", "create `<slug>.json`", or there's no existing file in `src/data/mappings/` for the show. Covers AniList GraphQL ID/count lookup, web research for arc boundaries, the JSON shape, `src/data/index.ts` registration, and the per-mapping commit.

Triggers on:

- "map `<show>`"
- "add a mapping for `<show>`"
- "create `<slug>.json`"
- Any reference to a show the user wants curated mapping data for, when `src/data/mappings/<slug>.json` does not exist.

## Location

`~/.claude/skills/kasane-arc-mapping/SKILL.md` — user-level, matching `kasane-commit-format` and every other kasane-related skill the user has.

## Workflow (the spine of the skill)

The skill walks Claude through five strictly ordered steps:

### 1. Identify the show + fetch metadata via AniList GraphQL

Single `curl` to `https://graphql.anilist.co` that resolves the user's title to:

- AniList anime ID
- AniList manga ID
- Episode count
- Chapter count
- `relations.edges` (so Claude can follow `SOURCE` / `ADAPTATION` to find the partner ID without a second query)

Exact query in the skill (verbatim):

```bash
curl -s https://graphql.anilist.co \
  -H 'Content-Type: application/json' \
  -d '{"query":"query($s:String){Page(perPage:5){media(search:$s,sort:SEARCH_MATCH){id type title{romaji english} episodes chapters relations{edges{relationType node{id type title{romaji english}}}}}}}","variables":{"s":"<SHOW>"}}' \
  | jq
```

Skill explains how to read the response:

- Pick the `MANGA` entry (the source of truth for `anilistMangaId` and `chapters`).
- Follow `relations.edges` where `relationType === "ADAPTATION"` and `node.type === "ANIME"` to get `anilistAnimeId` and `episodes`.
- If the user named the anime first, do the inverse: pick the `ANIME` entry, follow `relationType === "SOURCE"` and `node.type === "MANGA"`.
- **Sequels vs re-airs**:
  - *Sequels* (S2/S3 of the same adaptation, surfaced as `relationType === "SEQUEL"`) — use the **first season's** AniList anime ID as `anilistAnimeId`; episode counts in `mappings[]` are cumulative across seasons (see `my-hero-academia.json` using id `21459` = S1).
  - *Re-airs* (alternate full adaptations of the same manga, e.g. HxH 1999 vs 2011, Fruits Basket 2001 vs 2019) — pick the canonical one and disambiguate via year in the slug (`hunter-x-hunter-2011`, `fruits-basket-2019`).
- Episode/chapter counts can be `null` on AniList for the wrong partner type or for ongoing series — always read `episodes` from the `ANIME` entry and `chapters` from the `MANGA` entry.

### 2. Research arc boundaries on the web

Skill names sources in priority order:

1. **Show's fandom wiki** (best for arc names + per-arc chapter ranges): `<show>.fandom.com/wiki/Story_Arcs` or `/wiki/<Arc_Name>`.
2. **AniList forum threads** ("Episode-to-Chapter Guide for `<show>`") — community-curated and tend to use cumulative episode counts already, matching this repo's convention.
3. **Wikipedia "List of `<show>` episodes"** — authoritative for episode counts per season and corresponding manga volumes/chapters.
4. **r/`<show>` "where to start reading from the anime" / "anime-manga sync" threads** — useful sanity check.

Skill notes that **canonical arc names** typically come from the fandom wiki, and **precise chapter boundaries** typically come from per-arc chapter lists on the same wiki.

### 3. Draft the JSON

**File path**: `src/data/mappings/<kebab-slug>.json`

**Slug rules**:

- Lowercase, ASCII, hyphenated.
- Numerals stay (`3-gatsu-no-lion`).
- Subtitles dropped or hyphenated (`bocchi-the-rock`, not `bocchi-the-rock!`).
- Franchise re-airs disambiguated by year (`fruits-basket-2019`, `hunter-x-hunter-2011`).
- Prefer the English title's slug if the show is widely known by it (`demon-slayer`, not `kimetsu-no-yaiba`); fall back to romaji when there is no English title (`gintama`, `mushishi`).

**Required fields**:

```json
{
  "anilistAnimeId": <int>,
  "anilistMangaId": <int>,
  "title": "<English title if present, else romaji>",
  "sourceNotes": "<see template below>",
  "mappings": [ ... ]
}
```

**`sourceNotes` template** — one short paragraph covering:

- Cumulative episode arithmetic: `"Cumulative episodes across S1 (11) + S2 (13)"`.
- Manga state: `"Manga complete at 171 chapters"` or `"Manga ongoing (current ch. 432)"`.
- Caveats when applicable: `"4-koma source — chapter ranges are approximate"`, `"Episodic/anthology adaptation, ~1 chapter per episode"`, `"Arc boundaries from well-known manga arcs"`.

**`mappings[]` entries**:

```json
{ "episodes": [<start>, <end>], "chapters": [<start>, <end>], "arc": "<Name>" }
```

- Episodes are **cumulative** across seasons. S2E1 of a 12-ep S1 is `episode 13`. This matches every existing file; see `my-hero-academia.json` (`episodes: [14, 25]` for the U.A. Sports Festival arc that opens S2).
- **Drop `episodes`** for unadapted tail arcs — see `oshi-no-ko.json` lines 12–14 for the pattern. The runtime tolerates entries with only `chapters`.
- Last entry must extend to the final chapter count from AniList — or, for ongoing manga, to the last published chapter.

**Worked examples in the skill**:

- `my-hero-academia.json` (multi-season, ongoing-then-complete shonen — full episode + chapter ranges everywhere except the epilogue).
- `oshi-no-ko.json` (multi-season anime, manga finished ahead — last three arcs are `chapters`-only).

### 4. Register in `src/data/index.ts`

Two mechanical edits, both at the end of their respective blocks (commit history shows new mappings are always appended, never inserted alphabetically):

1. Add `import <camelCaseName> from '@/data/mappings/<slug>.json';` at the end of the import block (after the most recent import).
2. Append `<camelCaseName>,` at the end of the `ALL_MAPPINGS` array (after the most recent entry).

**Naming gotcha — kebab → camel is not mechanical when the romaji slug doesn't English well.** Examples from the existing file:

- `3-gatsu-no-lion.json` → `marchComesInLikeALion` (English title is used because `3GatsuNoLion` looks like a typo).
- `bleach-tybw.json` → `bleachTybw` (acronym kept).
- `fruits-basket-2019.json` → `fruitsBasket2019` (year preserved).

Rule the skill encodes: **default to direct kebab→camel; switch to an English-title camel only when the romaji camel is illegible or starts with a digit.**

### 5. Verify + commit

- Run `bun run typecheck` (verify the script name from `package.json` first — the skill notes that the project uses bun, not npm, per the user's memory).
- Commit with subject `KSN: add \`<slug>.json\` arc mapping` per the [[kasane-commit-format]] skill.
- **One mapping per commit.** Never batch.
- Body template:

  ```
  - N arcs covering <coverage summary>
  - anime `<id>` → manga `<id>`
  - register in `src/data/index.ts` `ALL_MAPPINGS`
  ```

## Structure of the SKILL.md file

```
---
name: kasane-arc-mapping
description: <as above>
---

# kasane Arc Mapping

## Overview
  - what an arc mapping is, what it powers in the app (`EpisodeChapterRail` etc.)
  - one-mapping-per-commit invariant
  - links to [[kasane-commit-format]]

## The Five-Step Workflow
  ### 1. AniList GraphQL lookup
    - the curl block, verbatim
    - how to read the response
    - handling re-airs / multiple adaptations
  ### 2. Web research for arc boundaries
    - source priority list
    - what each source is good for
  ### 3. Draft the JSON
    - file path + slug rules
    - required fields
    - sourceNotes template
    - mappings[] entries (cumulative episodes, unadapted tail, etc.)
    - two worked examples (MHA + Oshi no Ko)
  ### 4. Register in src/data/index.ts
    - import + ALL_MAPPINGS append
    - kebab → camel gotcha
  ### 5. Verify + commit
    - `bun run typecheck`
    - commit template, links to [[kasane-commit-format]]

## Quick Reference
  - table: slug, title, IDs, file path, registration site, commit subject

## Red Flags — STOP and Rewrite
  - table of "Thought → Reality" entries:
    - "I'll just guess the chapter count" → No. GraphQL it.
    - "Episodes should reset per season" → No. Cumulative across seasons.
    - "I'll batch two mappings in one commit" → No. One per commit.
    - "Skipping `bun run typecheck` is fine for JSON" → No. The import edit can break the build.
    - "I'll insert alphabetically into `ALL_MAPPINGS`" → No. Always append.
    - "`3-gatsu-no-lion` becomes `3GatsuNoLion`" → No. Identifier can't start with a digit; use the English-title camel.
    - "I'll use `npm run typecheck`" → No. This repo uses `bun`.

## Common Rationalizations
  - table of "Excuse → Reality" — mirror of red flags, framed as in-the-moment self-talk.
```

## Out of scope

- **Updating an existing mapping** (corrections, new arcs for ongoing manga). Separate concern; the skill explicitly notes it covers only *creation* of a new mapping file. Updates are handled ad hoc.
- **Auto-fetching arc data from any single source.** Wikis differ in completeness; the skill lists priorities but does not script web fetches — Claude does them adaptively.
- **Auto-running the GraphQL query.** Claude runs the curl block itself; the skill provides the snippet.

## Open questions

None. All resolved during brainstorming:

- Scope: full workflow including research.
- Research method: AniList GraphQL + web research.
- Location: user-level (`~/.claude/skills/`).
