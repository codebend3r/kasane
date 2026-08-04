/**
 * Static server for the Expo web export, used by Playwright.
 *
 * Mirrors the two `netlify.toml` behaviours the app depends on: the SPA fallback
 * to `index.html` (Expo Router web output is a single document with client
 * routing) and the `/_mdx/*` proxy to the MangaDex API. Serving the real `dist/`
 * means the e2e suite exercises the same bundle that ships.
 *
 * Uses node APIs rather than `Bun.serve` so it typechecks under the repo's
 * tsconfig without pulling in Bun's global types.
 *
 * Run: bun run e2e/serve.ts   (after `bun run build:web`)
 */
import * as fs from "fs";
import * as http from "http";
import * as path from "path";

const PORT = Number(process.env.E2E_PORT ?? 4173);
const DIST = path.resolve(__dirname, "..", "dist");
const MANGADEX = "https://api.mangadex.org";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error(`no build at ${DIST} — run \`bun run build:web\` first`);
  process.exit(1);
}

const resolveFile = (pathname: string): string | null => {
  const candidate = path.join(DIST, path.normalize(pathname));
  if (!candidate.startsWith(DIST)) return null; // reject traversal
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    ? candidate
    : null;
};

const proxyMangaDex = async (
  url: string,
  res: http.ServerResponse,
): Promise<void> => {
  const upstream = await fetch(`${MANGADEX}${url.slice("/_mdx".length)}`);
  const body = await upstream.text();
  res.writeHead(upstream.status, {
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
  });
  res.end(body);
};

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";

  if (url.startsWith("/_mdx/")) {
    proxyMangaDex(url, res).catch(() => {
      res.writeHead(502).end("mangadex proxy failed");
    });
    return;
  }

  const file = resolveFile(url.split("?")[0]) ?? path.join(DIST, "index.html");
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream",
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`serving ${DIST} on http://localhost:${PORT}`);
});
