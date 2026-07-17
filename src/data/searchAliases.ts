// Search aliases now live in the `search_aliases` table and are loaded at
// launch by the catalog fetch (see `useHydrateSearchAliases`). Until that
// resolves the table is empty and queries pass through unchanged.
let aliases: Record<string, string> = {};

export function setSearchAliases(next: Record<string, string>): void {
  aliases = next;
}

export function applySearchAlias(query: string): string {
  const key = query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return aliases[key] ?? query;
}
