# kasane

## TypeScript

- Never use `interface`; always use `type`.
- Do not cast to types, and never use `any`. Prefer type guards.
- Prefer `const` over `let` or `var`. Favor an immutable style.

## Styling

- Never use margins. Use `display: grid` with `gap` and `padding` for spacing. Only fall back to margins if absolutely unavoidable.

## Commits

- Create a commit after every discrete change; do not batch.
- Subject must start with `KSN:` followed by a short title (e.g., `KSN: a short title`).
- Favor bullet points in the body. Keep it concise and easy to read.
