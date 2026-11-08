import { MANGADEX_USER_AGENT, upstreamUrl } from "@/data/mangadexRoutes";

/**
 * The MangaDex proxy at Netlify's edge, mounted on `/_mdx/*` and
 * `/_mdx-covers/*` by `netlify.toml`. MangaDex answers a browser User-Agent
 * with a bot challenge, and a Netlify rewrite forwards that header unchanged,
 * so this function makes the upstream request itself with a non-browser
 * User-Agent and streams the reply back. `src/data/mangadexRoutes.ts` owns the
 * routes and the User-Agent; `netlify/import_map.json` maps the alias for
 * Deno. Edge functions must be the module's default export.
 */
export default async function mangadex(
  request: Request,
): Promise<Response | undefined> {
  const url = new URL(request.url);
  const target = upstreamUrl(`${url.pathname}${url.search}`);
  if (!target) return undefined;
  const upstream = await fetch(target, {
    headers: { "User-Agent": MANGADEX_USER_AGENT },
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": upstream.headers.get("cache-control") ?? "no-store",
    },
  });
}
