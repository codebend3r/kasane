# kasane

## TypeScript

- Never use `interface`; always use `type`.
- Do not cast to types, and never use `any`. Prefer type guards.
- Prefer `const` over `let` or `var`. Favor an immutable style.

## Code style

- Prefer `reduce` over `for` loops when possible. Never use `for/in` or `for/of` loops; reach for `Array.prototype` methods (`map`, `filter`, `reduce`, `flatMap`, etc.) when the value is an array.
- Prefer double-bang (`!!value`) for boolean conversion.
- Prefer optional chaining (`?.`). When optional chaining is used, ALWAYS pair it with nullish coalescing (`??`) to supply a fallback

## Styling

- Never use margins. Use `display: grid` with `gap` and `padding` for spacing. Only fall back to margins if absolutely unavoidable.

## Commits

- Create a commit after every discrete change; do not batch.
- Subject must start with `KSN:` followed by a short title (e.g., `KSN: a short title`).
- Favor bullet points in the body. Keep it concise and easy to read.
