---
name: version-bumper
description: Use when asked whether kasane is due for a version bump — "should we bump the version", "check main for a bump", "run the version bumper" — or after merging work into main and wondering if the release version is stale. Decides patch vs minor vs major and asks yes/no before writing anything.
---

# Version bumper

Read what has landed on `main` since the last release tag, decide whether it warrants a bump and at what level, then ask the user a single yes/no question. On **yes**, write the new version into both files and commit. On **no**, touch nothing.

This skill stops at the commit. Tagging, pushing, and building are the `release` skill's job.

## Establish the baseline

```bash
git switch main && git pull
git describe --tags --abbrev=0 --match 'v*' main   # last released version
node -p "require('./package.json').version"
node -p "require('./app.json').expo.version"
```

`package.json` and the latest tag must agree. If they don't, someone bumped without tagging or tagged without bumping — report that and stop; there is no reliable baseline to measure against.

`app.json` is expected to disagree. It has drifted (it sat at `1.0.0` while `package.json` reached `1.2.1`). Do not treat the drift as the baseline and do not increment from it — a bump sets **both** files to the same new value, realigning `app.json` in the process.

## Enumerate what is unreleased

```bash
LAST=$(git describe --tags --abbrev=0 --match 'v*' main)
git log --oneline "$LAST"..main
git diff --stat "$LAST"..main
```

## Split shipping from non-shipping

Only changes that reach a user's device can justify a bump. Sort every changed path:

| Ships                                                             | Does not ship                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `app/`, `src/`, `assets/`                                         | `.claude/`, `docs/`, `README.md`, `CLAUDE.md`, `LICENSE`, `.github/` |
| `dependencies` in `package.json`, `app.json` config, `src-tauri/` | `e2e/`, `*.test.ts`, `scripts/`, `devDependencies`                   |

`supabase/` sits between the two: a migration reaches users through the backend without changing the bundle, so it never justifies a client bump on its own. It only counts when client code shipped alongside it.

**A release made only of non-shipping paths is not a release.** Skills, docs, and the licence file are real work that changes nothing a user can observe. Say so plainly and recommend no bump.

## Pick the level

Classify every shipping change; the highest level present wins.

| Level     | What puts it here                                                                                                                                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **major** | Something breaks for an existing install: a persisted zustand store or `partialize` shape changed with no migration, an `AsyncStorage` cache key changed, a route path under `app/` removed or renamed that deep links point at, a dropped platform target, or a Supabase column or policy removal that older clients still read. |
| **minor** | New reachable surface or capability: a new route file in `app/`, a screen users can now get to, a new user-facing feature, or a framework upgrade that changes behaviour (an Expo SDK jump).                                                                                                                                      |
| **patch** | Behaviour users already had, now correct: bug fixes, a11y and contrast fixes, copy, token and style corrections, perf, dependency pins, and refactors that leave behaviour identical.                                                                                                                                             |

Ask the breaking question against the _installed_ app, not the source. kasane has no public API — "breaking" means a user who opens the app after updating loses saved progress, lands on a dead deep link, or sees a read fail.

## Decide whether it is enough

- Any shipping change at **minor** or **major** → recommend the bump. One is enough.
- Shipping **patch** changes that alter what a user experiences (a fix, a contrast correction, corrected copy) → recommend a patch. One is enough.
- Only behaviour-identical refactors, formatting, or dependency pins → these accumulate. Recommend a patch once there are three or more, or when a dependency upgrade rides along. Below that, recommend no bump and say what is waiting.
- No shipping changes at all → recommend no bump.

## Ask

One question, two answers. Show the reasoning above it — the current version, the proposed version, the commits that drove the level, and anything excluded as non-shipping — so a "no" is an informed one.

Options are `Yes — bump to <X.Y.Z>` and `No — leave it at <current>`. Do not offer a menu of levels; the skill's job is to have already decided. If the user overrides with a different level, take it and bump to that instead.

Recommending **no bump** still gets the question asked, with the options inverted (`No — nothing to release` first), because the user may know about unpushed work the git history does not show.

## On yes, bump both files

```bash
VERSION=1.2.2
npm pkg set version=$VERSION
python3 - <<EOF
import json
p = "app.json"
d = json.load(open(p))
d["expo"]["version"] = "$VERSION"
json.dump(d, open(p, "w"), indent=2)
open(p, "a").write("\n")
EOF
git diff --stat package.json app.json    # both must appear
```

Then `bun run system-check`, and commit the two files alone under the repo's convention:

```
KSN: bump version to 1.2.2
```

Older bump commits in this history are bare version numbers (`1.2.1`) left by `npm version`. Do not copy them — `CLAUDE.md` requires the `KSN:` subject, and `npm pkg set` avoids the auto-commit and auto-tag that produced them.

Stop there. Report the new version and point at the `release` skill for the tag and the builds.

## Common mistakes

| Mistake                                                  | Consequence                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Counting skills, docs, or `LICENSE` toward a bump        | A release users cannot tell apart from the last one. Most of what has landed since `v1.2.1` is exactly this.        |
| Bumping only `package.json`                              | `app.json` drifts further and store listings keep the old version. That drift is how it reached `1.0.0` vs `1.2.1`. |
| Incrementing `app.json` from its own stale value         | Two different versions, still wrong. Both files get the same new string.                                            |
| Calling a new screen a patch                             | `1.2.1` shipped a side menu and a browsable catalog as a patch. New reachable surface is a minor.                   |
| Tagging or pushing here                                  | This skill ends at the commit. `release` owns the tag, Netlify, and the store builds.                               |
| Bumping when the tag and `package.json` already disagree | The baseline is unknown, so the level is a guess. Fix the mismatch first.                                           |
| Offering the user a menu of levels                       | The decision is the skill's. Ask yes/no and accept an override if one comes.                                        |
