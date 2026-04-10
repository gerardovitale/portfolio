import { expect, test } from "@playwright/test";
import { enabledPageSections, homeSection, siteData } from "../src/data/site";
import { defaultSiteUrl } from "../src/lib/meta";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("routes are reachable from the home page", async ({ page }) => {
  await page.goto("/");
  const primaryNav = page.getByRole("navigation", { name: "Primary" });
  const featuredProject = siteData.sections
    .find((section) => section.id === "projects")
    ?.projects.find((project) => project.status === "featured");

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
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: featuredProject?.title ?? "",
        }),
      ).toBeVisible();
    }

    if (section.id === "experience") {
      const firstRole = section.entries[0]?.role;
      const firstCompany = section.entries[0]?.company;

      await expect(
        page.getByRole("button", {
          name: new RegExp(
            `${escapeRegex(firstRole ?? "")}.*${escapeRegex(firstCompany ?? "")}`,
            "i",
          ),
        }),
      ).toBeVisible();
    }

    await page.goto("/");
  }
});

test("home page publishes production metadata and a direct contact CTA", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${defaultSiteUrl}/`,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `${defaultSiteUrl}/og-preview.png`,
  );
  await expect(
    page.getByRole("link", { name: "Discuss a project" }),
  ).toHaveAttribute("href", `mailto:${siteData.person.email}`);
});

test("health endpoint responds with ok", async ({ request }) => {
  const response = await request.get("/healthz.json");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("robots endpoint exposes the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");

  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain(
    `Sitemap: ${defaultSiteUrl}/sitemap-index.xml`,
  );
});
