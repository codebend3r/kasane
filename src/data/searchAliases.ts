// Search aliases live in the `search_aliases` table and arrive with the
// catalog. Callers pass the table in, so the resolved term — not a hidden
// module variable — is what a search query keys on.

const aliasKey = (query: string): string =>
  query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** The aliased search term, or `query` untouched when no alias matches. */
export function applySearchAlias({
  query,
  aliases,
}: {
  query: string;
  aliases: Readonly<Record<string, string>>;
}): string {
  return aliases[aliasKey(query)] ?? query;
}
