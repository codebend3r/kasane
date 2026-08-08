# kasane

## Workflow

- Do not commit anything until I tell you to.
- Do not push anything until I tell you to.
- Do not merge anything until I tell you to.
- Do not create a PR until I tell you to.
- Do not create a branch until I tell you to.

## Branches

- Branch names are flat. Never put a branch in a folder — no `feature/`, `fix/`, `bug/`, or any other prefix folder, and no slashes anywhere in the name.
- Branch names are kebab-case and 1 to 5 words, describing what the branch is for: `sigil-integrity`, `anime-links`, `skills-cleanup`.

## Project structure

- `app/` holds expo-router routes and nothing else. One screen per file.
- `src/components/` holds shared UI. A component here must work on both the anime and manga side of a series.
- `src/data/` holds pure functions. No React, no network, no module-level state.
- `src/state/` holds zustand stores. `src/api/` holds network clients. `src/types/` holds shared types.
- `src/theme.ts` is the only file allowed to contain a raw colour value.
- Route files stay under ~300 lines. Past that, extract the pieces into `src/components/`.

## Imports and exports

- Always import through the `@/...` alias. Never write an upward-relative import (`../`).
- `export default` belongs only in `app/**`, where expo-router requires it. Everywhere else, named exports only.
- No barrel files. Import from the module that defines the thing.

## TypeScript

- Always use type aliases. Never use TypeScript interfaces anywhere, including `declare global` augmentations
- Use type guards wherever possible.
- Unit test all type guard functions
- Never use `any` types; prefer type narrowing or type guards
- Never under any circumstance cast types and never double cast: `as any as string`
- If type can't be inferred and type narrowing is not an option, use `unknown` types

## Code style

- Always prefer immutable data structures and operations
- Prefer `reduce` over `for` loops when possible. Never use `for/in` or `for/of` loops; reach for `Array.prototype` methods (`map`, `filter`, `reduce`, `flatMap`, etc.) when the value is an array.
- Prefer double-bang (`!!value`) for boolean conversion.
- Prefer short-circuit (`&&`) over a ternary when the else branch is `null` or `undefined`, especially in React rendering. Do: `{isActive && <Badge />}`. Don't: `{isActive ? <Badge /> : null}`. Guard the condition so it is a real boolean (`!!count && ...`), never a bare number that could render `0`.
- Prefer optional chaining (`?.`). When optional chaining is used, ALWAYS pair it with nullish coalescing (`??`) to supply a fallback.
- Prefer a single configurable object parameter over multiple positional parameters so argument order doesn't matter. Don't: `doSomething(foo, bar, hello)`. Do: `doSomething({ foo, bar, hello })`.

## React components

- Declare components with `function`, never as an arrow assigned to a const.
- Take props as a single typed object parameter.
- Call every hook unconditionally at the top of the component. Never early-return before a hook; gate a query with `enabled` instead.
- Put `StyleSheet.create` at the bottom of the file. Anything static belongs in it, not in an inline style object.
- Every `Pressable`, `Link`, and `TextInput` gets an `accessibilityRole` and an `accessibilityLabel`.

## Styling

- Never use margins. Use `display: grid` with `gap` and `padding` for spacing. Only fall back to margins if absolutely unavoidable.
- Always consider responsive design for every change. Every layout must support small, medium, and large screens — check each breakpoint before calling a change done.
- Never write a raw hex value, spacing number, or font-family string in a component. Read `COLOR`, `SPACE`, `FONT`, `ARC_COLORS`, and `MOVIE_COLOR` from `@/theme`.
- A colour that is missing from `@/theme` gets added there first, named by role, then used.

## Data fetching

- Every remote read goes through `useQuery`. Never fetch inside `useEffect`.
- Query keys are arrays whose first element is a literal string. Every value the request varies on goes in the key.
- Always set `staleTime` explicitly. Never rely on the default.
- Gate a query with `enabled`, never by calling the hook conditionally.
- Only the catalog and cover queries persist to `AsyncStorage`. Everything else stays in memory.

## State

- zustand owns client state. TanStack Query owns server state. Never copy one into the other.
- Subscribe with a selector — `useProgress((s) => s.byRouteId)` — never to the whole store.
- Persisted stores use `persist` with `partialize` so only real data is written.
- Derive with `useMemo`. Never store a value you can compute.

## Testing and verification

- Everything in `src/data/`, `src/state/`, and `src/api/` needs a colocated `*.test.ts`. Type guards always get one.
- Browser-level journeys go in `e2e/` as Playwright specs.
- Run `bun run system-check` before calling any change done. Never claim it passes without showing the output.

## Security and config

- The Supabase publishable key is committed on purpose. Treat everything in the client bundle as public.
- Service-role keys live in `scripts/` environment variables and never reach `app/` or `src/`.
- User data is protected by row-level security. A client-side check is a convenience, never the boundary.

## Commits

- Create a commit after every discrete change; do not batch.
- Subject must start with `KSN:` followed by a short title (e.g., `KSN: a short title`).
- Favor bullet points in the body. Keep it concise and easy to read.

## Pull Requests

- Should follow the same naming convention as commits and every PR title should start with `KSN: a short title`
- The body of the PR should be minimal and favour bullet points

## Skills

The rules above are the always-on baseline. These skills carry the depth — reach for the one that matches before starting work.

| Working on                                            | Skill                   |
| ----------------------------------------------------- | ----------------------- |
| Colours, spacing, fonts, any `StyleSheet`             | `design-tokens`         |
| Screen readers, contrast, keyboard nav                | `accessibility`         |
| A new component, or a route file that grew too big    | `universal-component`   |
| iOS / Android / web / Tauri differences               | `cross-platform-parity` |
| Logic in `src/data/`, `src/state/`, `src/api/`        | `domain-tests`          |
| Routing, deep links, Netlify fallback, MangaDex proxy | `e2e`                   |
| Schema, columns, policies, RLS                        | `supabase-migration`    |
| Adding a series that has no catalog entry             | `arc-mapping`           |
| Changing a series already in the catalog              | `mapping-correction`    |
| Checking the catalog for bad data                     | `mapping-audit`         |
| Quick lookup, the rail, arc detail, empty states      | `quick-lookup-ux`       |
| Whether main has earned a version bump, and which     | `version-bumper`        |
| Version bumps, tags, Netlify, Tauri, store builds     | `release`               |
| Main updated; rebasing the other branches onto it     | `active-rebaser`        |
| Writing a commit message or PR title                  | `commit-messages`       |
