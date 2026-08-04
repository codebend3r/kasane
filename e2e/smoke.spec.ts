import { expect, test, type Page } from "@playwright/test";

/**
 * The three journeys the README promises, end to end against the real export.
 *
 * Selectors prefer visible copy the app owns (headings, labels, placeholders)
 * over structure, because React Native Web renders opaque nested divs whose
 * shape changes whenever a StyleSheet does.
 */

const search = async (page: Page, term: string): Promise<void> => {
  const box = page.getByPlaceholder(/search/i);
  await expect(box).toBeVisible();
  await box.fill(term);
};

test.describe("catalog", () => {
  test("home renders the wordmark and a populated grid", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Kasane", { exact: true })).toBeVisible();
    await expect(page.getByText(/anime/i).first()).toBeVisible();
  });

  test("search surfaces a known series", async ({ page }) => {
    await page.goto("/");
    await search(page, "One Piece");
    await expect(page.getByText(/one piece/i).first()).toBeVisible();
  });
});

test.describe("series detail", () => {
  // Fullmetal Alchemist: Brotherhood — a stable, fully mapped catalog entry.
  const ANIME_ROUTE = "/anime/5114";

  test("shows the episode-to-chapter rail", async ({ page }) => {
    await page.goto(ANIME_ROUTE);
    await expect(page.getByText(/quick lookup/i)).toBeVisible();
  });

  test("quick lookup answers an episode with a chapter range", async ({
    page,
  }) => {
    await page.goto(ANIME_ROUTE);
    const input = page.getByPlaceholder(/e\.g\./).first();
    await expect(input).toBeVisible();
    await input.fill("12");
    await expect(page.getByText(/chapters?\s*\d+/i).first()).toBeVisible();
  });
});

test.describe("accounts", () => {
  test("login route renders a sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });
});

test.describe("routing", () => {
  test("SPA fallback serves a deep link directly", async ({ page }) => {
    const res = await page.goto("/manga/30002");
    expect(res?.status()).toBe(200);
    await expect(page.getByText("Kasane", { exact: true })).toBeVisible();
  });
});
