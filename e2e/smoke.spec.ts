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

  // AniList ranks Attack on Titan past its first page for "attack", and
  // "Mapped only" is on by default, so this once came back empty.
  test("a partial title finds the mapped series", async ({ page }) => {
    await page.goto("/");
    await search(page, "attack");
    await expect(page.getByText("Attack on Titan").first()).toBeVisible();
  });
});

test.describe("series detail", () => {
  // Fullmetal Alchemist: Brotherhood — a stable, fully mapped catalog entry.
  const ANIME_ID = 5114;
  const SERIES_ROUTE = `/series/${ANIME_ID}`;

  test("shows the episode-to-chapter map", async ({ page }) => {
    await page.goto(SERIES_ROUTE);
    await expect(page.getByText(/episode ↔ chapter map/i)).toBeVisible();
    await expect(page.getByText(/quick lookup/i)).toBeVisible();
  });

  test("quick lookup answers an episode with a chapter range", async ({
    page,
  }) => {
    await page.goto(SERIES_ROUTE);
    const input = page.getByPlaceholder(/e\.g\./).first();
    await expect(input).toBeVisible();
    await input.fill("12");
    await expect(page.getByText(/chapters?\s*\d+/i).first()).toBeVisible();
  });

  test("legacy side-specific links land on the series screen", async ({
    page,
  }) => {
    await page.goto(`/anime/${ANIME_ID}`);
    await expect(page).toHaveURL(new RegExp(`${SERIES_ROUTE}$`));
    await expect(page.getByText(/quick lookup/i)).toBeVisible();
  });
});

test.describe("movies", () => {
  // Naruto: a mapped series with a long film list.
  const NARUTO = "/series/30011";

  test("stay collapsed until opened, with no seasons list above", async ({
    page,
  }) => {
    await page.goto(NARUTO);
    const toggle = page.getByRole("button", { name: /^movies,/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText(/after ep 713/i)).toHaveCount(0);
    // The franchise's seasons were a text list under the header; it is gone.
    await expect(page.getByText(/seasons & entries/i)).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /^the last: naruto the movie/i }),
    ).toHaveCount(0);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/after ep 713/i)).toBeVisible();
  });
});

test.describe("mangadex proxy", () => {
  // MangaDex refuses browser User-Agents, so a cover can only arrive through
  // the same-origin proxy. Fullmetal Alchemist: a stable, fully mapped series.
  test("volume covers load through /_mdx-covers", async ({ page }) => {
    await page.goto("/series/5114");
    await expect(page.getByText("Volumes", { exact: true })).toBeVisible();
    const cover = page.locator('img[src^="/_mdx-covers/"]').first();
    await expect(cover).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() =>
        cover.evaluate((img) =>
          img instanceof HTMLImageElement ? img.naturalWidth : 0,
        ),
      )
      .toBeGreaterThan(0);
    await expect(page.getByText(/no volume art/i)).toHaveCount(0);
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
