import { expect, test } from "@playwright/test";
import { enabledPageSections, homeSection } from "../src/data/site";

test("routes are reachable from the home page", async ({ page }) => {
  await page.goto("/");
  const primaryNav = page.getByRole("navigation", { name: "Primary" });

  await expect(
    page.getByRole("heading", { level: 1, name: homeSection.hero.headline }),
  ).toBeVisible();

  for (const section of enabledPageSections) {
    await primaryNav
      .getByRole("link", { name: section.navLabel, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${section.id}$`));
    await expect(
      page.getByRole("heading", { level: 1, name: section.intro.title }),
    ).toBeVisible();

    if (section.id === "projects") {
      await page.getByRole("button", { name: "featured" }).click();
      await expect(page.getByText("Zen Python Portfolio")).toBeVisible();
    }

    if (section.id === "experience") {
      await expect(
        page.getByRole("button", { name: /senior data engineer/i }),
      ).toBeVisible();
    }

    await page.goto("/");
  }
});

test("health endpoint responds with ok", async ({ request }) => {
  const response = await request.get("/healthz.json");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
});
