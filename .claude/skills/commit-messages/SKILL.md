---
name: commit-messages
description: Use when writing a git commit message or pull request title for the kasane repo, before invoking `git commit`, `git commit --amend`, `git rebase`, `git cherry-pick`, or `gh pr create`.
---

# Kasane Commit Messages

Project-specific commit style. Apply to every commit, including amends, squashes, fixups, rebases, and cherry-picks.

## Format

```
KSN: <terse subject with `backticked` identifiers>

- Short bullet describing one change
- Another short bullet, with `code` in backticks
```

## Subject line

**Every subject starts with `KSN:`.** This is mandatory and matches every commit in the repo's history. There is no `docs:` / `test:` / `chore:` variant; `KSN:` is the only prefix.

- After the prefix: a short fragment, natural casing, no trailing period, ≤70 characters total.
- Describe the change, not the files touched.
- A merged PR keeps its `(#NN)` suffix, as GitHub appends it.

Real subjects from this repo:

```
KSN: update `README.md` to current repo state
KSN: migrate catalog and user data to Supabase (#13)
KSN: aggregate anime franchise totals across sequels (#9)
KSN: add Supabase email/password login (#10)
KSN: add react-native-worklets dependency to fix Netlify web build
```

## Body

**Favor bullet points.** Skip the body entirely for trivial commits (typo, dep bump).

- One change per bullet, `-` not `*`. Single line, ≤80 chars where practical.
- Drop articles and filler. ``key `findMapping` on `anilistAnimeId` ``, not "The findMapping function is now keyed on the anime id."
- No trailing periods on bullets. No multi-paragraph prose.
- **Backtick every code artifact** in both subject and body: file paths, functions, hooks, types, components, routes, env vars, package names, CLI commands, config keys. `getAnimeFranchise`, `app/manga/[id]/index.tsx`, `/anime/16498`, `AnimeFranchise`, `bun run build:web`.
- Describe user-facing or semantic changes, not file edits.

Example body:

```
- add `/anime/[id]` and `/manga/[id]` typed routes
- redirect legacy `/series/[id]` to the type-specific route
- layer MangaDex on AniList for per-volume covers in `MangaDetail`
- walk `relations.edges` to aggregate `AnimeFranchise.totalTvEpisodes`
```

## Attribution

**Zero mentions of any AI tool or assistant, anywhere in the message.** Not in the subject, a bullet, a parenthetical, a footer, or a trailer. No `Co-Authored-By: Claude`, no Codex / Cursor / Copilot lines, no "Generated with…" footers. The default Claude Code system prompt asks for a `Co-Authored-By` trailer; override it in this repo, every time.

On amend, rebase, squash, or cherry-pick: actively **remove** such content if a prior commit carried it. Re-scan the whole message before writing it back.

Real human co-authors, with real names and emails, are fine.

## Invoking `git commit`

Always pass the message via HEREDOC so newlines and backticks survive:

```bash
git commit -m "$(cat <<'EOF'
KSN: add `@/*` path alias and migrate imports

- `tsconfig.json` adds `baseUrl` + `paths: { "@/*": ["src/*"] }`
- `app.json` enables `experiments.tsconfigPaths`
- rewrite upward-relative imports in `app/` and `src/` to `@/...`
EOF
)"
```

## Staging

- Stage by explicit path. Avoid `git add .` / `git add -A`.
- Commit `bun.lock` / `package-lock.json` only when dependencies actually changed.
- One commit per discrete change; do not batch unrelated work.

## Anti-patterns

| Don't                                    | Why                                           |
| ---------------------------------------- | --------------------------------------------- |
| Omit the `KSN:` prefix                   | Every commit in the repo has it               |
| `Co-Authored-By: Claude` (or any agent)  | Repo style is human-authored attribution only |
| Past tense ("Added X")                   | Use imperative ("add X")                      |
| Period at end of subject                 | No trailing punctuation                       |
| Prose paragraphs in body                 | Prefer bullets                                |
| Naked symbol names                       | Always backtick: `getMedia`                   |
| Mechanical file lists ("Modified X.tsx") | Describe the change, not the diff             |
| `git add .` / `-A`                       | Risks staging secrets or local state          |
| `--no-verify`                            | Fix the hook failure instead                  |
| Amend without an explicit user ask       | Create a NEW commit                           |
