import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Runs against the real `dist/` export served by `e2e/serve.ts`, so the suite
 * covers the bundle that ships rather than a dev server. Build first:
 *
 *   bun run build:web && bun run e2e
 *
 * The screens depend on AniList and MangaDex over the network, so timeouts are
 * generous and assertions target text the app owns rather than remote content.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // On CI, annotate the diff via "github" and also emit the HTML report the
  // workflow uploads on failure; it embeds the traces and failure screenshots.
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run e2e/serve.ts",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
