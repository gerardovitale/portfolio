import { expect, test } from "@playwright/test";

test("routes are reachable from the home page", async ({ page }) => {
  await page.goto("/");
  const primaryNav = page.getByRole("navigation", { name: "Primary" });

  await expect(
    page.getByRole("heading", { level: 1, name: /gerardo vitale/i }),
  ).toBeVisible();

  await primaryNav.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /projects shaped/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: "featured" }).click();
  await expect(page.getByText("Zen Python Portfolio")).toBeVisible();

  await primaryNav
    .getByRole("link", { name: "Experience", exact: true })
    .click();
  await expect(page).toHaveURL(/\/experience$/);
  await expect(
    page.getByRole("button", { name: /senior data engineer/i }),
  ).toBeVisible();

  await primaryNav
    .getByRole("link", { name: "Interests", exact: true })
    .click();
  await expect(page).toHaveURL(/\/interests$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /the tools i use/i }),
  ).toBeVisible();
});

test("health endpoint responds with ok", async ({ request }) => {
  const response = await request.get("/healthz.json");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
});
