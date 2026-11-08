import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * The Node side of the MangaDex proxy, for the Metro dev server
 * (`metro.config.js`) and the e2e static server (`e2e/serve.ts`). Netlify
 * runs the same idea at the edge in `netlify/edge-functions/mangadex.ts`.
 *
 * The routes and User-Agent come in as arguments from `@/data/mangadexRoutes`
 * rather than being imported, so this file has no imports Node's `require`
 * would have to resolve through a tsconfig alias.
 */
export type MangaDexProxyOptions = {
  req: IncomingMessage;
  res: ServerResponse;
  /** The MangaDex URL a request path maps to, or null when it is not proxied. */
  upstreamUrl: (path: string) => string | null;
  /** The non-browser User-Agent MangaDex accepts. */
  userAgent: string;
};

/**
 * Answers a proxied MangaDex request with the upstream status, body and
 * content type. Resolves false, touching nothing, when `req` is not one.
 */
export async function proxyMangaDex({
  req,
  res,
  upstreamUrl,
  userAgent,
}: MangaDexProxyOptions): Promise<boolean> {
  const target = upstreamUrl(req.url ?? "/");
  if (!target) return false;
  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": userAgent },
    });
    const body = new Uint8Array(await upstream.arrayBuffer());
    res.writeHead(upstream.status, {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": upstream.headers.get("cache-control") ?? "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(502).end("mangadex proxy failed");
  }
  return true;
}
