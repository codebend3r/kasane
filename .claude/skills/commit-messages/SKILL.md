---
name: commit-messages
description: Use when writing a git commit message for the kasane repo, before invoking `git commit` or `gh pr create`.
---

# Kasane Commit Messages

Project-specific commit style for this repo. Apply to every commit.

## Format

```
<Imperative subject — capitalized, no period, ≤70 chars>

- Short bullet describing one user-facing change
- Another short bullet, with `code` in backticks
- One more if needed
```

## Subject line

- Imperative mood, capitalized first word, no trailing period.
- ≤70 characters. If you can't fit it, split the commit.
- Describe the change, not the files modified.

Real subjects from this repo:

- `Split anime/manga routes and enrich manga view with MangaDex`
- `Rebrand to Kasane and overhaul home + series experience`
- `Add Netlify deploy config`
- `Add react-native-worklets dependency to fix Netlify web build`

## Body

**Favor bullet points.** Skip the body entirely for trivial commits (typo, dep bump).

- One change per bullet. No prose paragraphs.
- Keep each bullet short — single line, ≤80 chars where practical.
- Use **backticks** around any function, file path, variable, route, type, or component: `getAnimeFranchise`, `app/manga/[id]/index.tsx`, `media.type`, `/anime/16498`, `AnimeFranchise`.
- Describe user-facing or semantic changes — not file edits.
  - ✅ `Add /manga/[id] route with deep linking` → with backticks: `` `/manga/[id]` ``
  - ❌ `Modified app/manga/[id]/index.tsx`

Example body:

```
- Add `/anime/[id]` and `/manga/[id]` typed routes
- Redirect legacy `/series/[id]` to the type-specific route
- Layer MangaDex on AniList for per-volume covers in `MangaDetail`
- Walk `relations.edges` to aggregate `AnimeFranchise.totalTvEpisodes`
```

## Attribution

**Never mention any AI agent or assistant in commit messages.** No `Co-Authored-By: Claude`, no Codex / Cursor / Copilot lines, no "🤖 Generated with …" footers. Commits read as if the human wrote them.

## Invoking `git commit`

Always pass the message via HEREDOC so newlines and backticks survive:

```bash
git commit -m "$(cat <<'EOF'
Subject line here

- First bullet referencing `getMedia`
- Second bullet
EOF
)"
```

## Staging

- Stage files by explicit path; avoid `git add .` / `git add -A`.
- `.claude/scheduled_tasks.lock` and similar local state are gitignored; don't force-add them.
- Commit `package-lock.json` only when dependencies actually changed.

## Anti-patterns

| Don't                                    | Why                                           |
| ---------------------------------------- | --------------------------------------------- |
| `Co-Authored-By: Claude` (or any agent)  | Repo style is human-authored attribution only |
| Past tense ("Added X")                   | Use imperative ("Add X")                      |
| Period at end of subject                 | No trailing punctuation                       |
| Prose paragraphs in body                 | Prefer bullets                                |
| Long wrapped bullet lines                | Keep each bullet short and single-line        |
| Naked symbol names                       | Always wrap in backticks: `getMedia`          |
| Mechanical file lists ("Modified X.tsx") | Describe the change, not the diff             |
| `git add .` / `-A`                       | Risks staging secrets or local state          |
| `--no-verify`                            | Fix the hook failure instead                  |
| Amend without explicit user ask          | Always create a NEW commit                    |
