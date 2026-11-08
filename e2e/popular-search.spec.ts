import { expect, test, type Page } from "@playwright/test";

/**
 * Searches for twenty of the most popular, most searched series, typed the way
 * people type them: partial, lower case, no punctuation. Each must surface its
 * curated catalog entry with "Mapped only" left on (the default), which is the
 * case that once came back empty when AniList ranked the series past its first
 * page of results ("attack" put Attack on Titan at #21).
 *
 * The assertion targets the result's link to `/series/<manga id>`, the catalog's
 * own key, so it holds whatever display title AniList returns.
 *
 * AniList allows 30 requests a minute per IP (`x-ratelimit-limit`), and twenty
 * parallel page loads trip it, which the app shows as "Something went wrong".
 * So the searches run one at a time, spaced out, and every AniList request
 * other than the search itself (the home grid, covers) is answered with an
 * empty page: only the search reaches AniList, one request per test.
 */
const SEARCH_OPERATIONS = /query\s+Search\b/;
const SPACING_MS = 3_000;

// Probes AniList once and, if the rest of the suite has used much of this
// minute's allowance, waits for the window to reset before searching.
const waitForAniListHeadroom = async (): Promise<void> => {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "{ Media(id: 1) { id } }" }),
  });
  const remaining = Number(res.headers.get("x-ratelimit-remaining") ?? 0);
  const resetAt = Number(res.headers.get("x-ratelimit-reset") ?? 0) * 1000;
  const retryAfter = Number(res.headers.get("retry-after") ?? 0) * 1000;
  const wait =
    res.status === 429
      ? retryAfter || 60_000
      : remaining < 25
        ? Math.max(resetAt - Date.now(), 0) || 60_000
        : 0;
  await new Promise((resolve) => setTimeout(resolve, wait));
};

const onlySearchReachesAniList = async (page: Page): Promise<void> => {
  await page.route("https://graphql.anilist.co/**", (route) =>
    SEARCH_OPERATIONS.test(route.request().postData() ?? "")
      ? route.continue()
      : route.fulfill({ json: { data: { Page: { media: [] } } } }),
  );
};
const POPULAR: readonly { query: string; title: string; seriesId: number }[] = [
  { query: "attack", title: "Attack on Titan", seriesId: 53390 },
  { query: "one piece", title: "One Piece", seriesId: 30013 },
  { query: "naruto", title: "Naruto", seriesId: 30011 },
  { query: "demon slayer", title: "Demon Slayer", seriesId: 87216 },
  { query: "jujutsu", title: "Jujutsu Kaisen", seriesId: 101517 },
  { query: "my hero", title: "My Hero Academia", seriesId: 85486 },
  { query: "death note", title: "Death Note", seriesId: 30021 },
  { query: "fullmetal", title: "Fullmetal Alchemist", seriesId: 30025 },
  { query: "hunter x hunter", title: "Hunter x Hunter", seriesId: 30026 },
  { query: "chainsaw", title: "Chainsaw Man", seriesId: 105778 },
  { query: "spy x family", title: "SPY x FAMILY", seriesId: 108556 },
  { query: "bleach", title: "Bleach", seriesId: 30012 },
  { query: "dragon ball", title: "Dragon Ball", seriesId: 30042 },
  { query: "one punch", title: "One-Punch Man", seriesId: 74347 },
  { query: "tokyo ghoul", title: "Tokyo Ghoul", seriesId: 63327 },
  { query: "mob psycho", title: "Mob Psycho 100", seriesId: 85189 },
  { query: "black clover", title: "Black Clover", seriesId: 86123 },
  { query: "haikyu", title: "Haikyu!!", seriesId: 65243 },
  { query: "frieren", title: "Frieren", seriesId: 118586 },
  { query: "solo leveling", title: "Solo Leveling", seriesId: 105398 },
];

test.describe("popular searches", () => {
  test.describe.configure({ mode: "default", timeout: 90_000 });

  test.beforeAll(async () => {
    test.setTimeout(90_000);
    await waitForAniListHeadroom();
  });

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(SPACING_MS);
    await onlySearchReachesAniList(page);
  });

  POPULAR.forEach(({ query, title, seriesId }) => {
    test(`"${query}" finds ${title}`, async ({ page }) => {
      await page.goto("/");
      const box = page.getByPlaceholder(/search/i);
      await expect(box).toBeVisible();
      await box.fill(query);
      await expect(
        page.locator(`a[href="/series/${seriesId}"]`).first(),
      ).toBeVisible();
    });
  });
});
