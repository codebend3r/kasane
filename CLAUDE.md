# kasane

## Workflow

- Do not commit anything until I tell you to.
- Do not push anything until I tell you to.
- Do not merge anything until I tell you to.
- Do not create a PR until I tell you to.
- Do not create a branch until I tell you to.

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

## Styling

- Never use margins. Use `display: grid` with `gap` and `padding` for spacing. Only fall back to margins if absolutely unavoidable.
- Always consider responsive design for every change. Every layout must support small, medium, and large screens — check each breakpoint before calling a change done.

## Commits

- Create a commit after every discrete change; do not batch.
- Subject must start with `KSN:` followed by a short title (e.g., `KSN: a short title`).
- Favor bullet points in the body. Keep it concise and easy to read.

## Pull Requests

- Should follow the same naming convention as commits and every PR title should start with `KSN: a short title`
- - The body of the PR should be minimal and favour bullet points
