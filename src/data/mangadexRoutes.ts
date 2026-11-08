/**
 * Where MangaDex lives and how the app reaches it. `api.mangadex.org` and the
 * covers CDN both answer a browser User-Agent with a bot challenge, so the web
 * build calls the same-origin proxy paths below and a proxy forwards with the
 * non-browser User-Agent. This is the one place the paths, hosts and
 * User-Agent are written down: the client (`src/api/mangadex.ts`) and every
 * proxy (`netlify/edge-functions/mangadex.ts`, `metro.config.js`,
 * `e2e/serve.ts`) read them from here.
 *
 * No imports, on purpose: Node's `require` loads it for Metro, the Deno edge
 * runtime loads it through `netlify/import_map.json`, and the web bundle loads
 * it like any other module.
 */
export const MANGADEX_USER_AGENT =
  "kasane (+https://github.com/codebend3r/kasane)";

/** Each MangaDex host the app reads, and the same-origin path that proxies it. */
export const MANGADEX_ROUTES = {
  api: { proxy: "/_mdx", upstream: "https://api.mangadex.org" },
  covers: {
    proxy: "/_mdx-covers",
    upstream: "https://uploads.mangadex.org/covers",
  },
} as const;

/** The MangaDex URL a request path maps to, or null when it is not proxied. */
export function upstreamUrl(path: string): string | null {
  const route = Object.values(MANGADEX_ROUTES).find((r) =>
    path.startsWith(`${r.proxy}/`),
  );
  return route ? `${route.upstream}${path.slice(route.proxy.length)}` : null;
}
