import { expect, test } from "@playwright/test";
import { getSiteContext } from "../src/data/site";
import { getPrimaryNavigationLabel } from "../src/lib/locale";
import { defaultSiteUrl } from "../src/lib/meta";

const locales = [
  {
    locale: "en" as const,
    rootRoute: "/",
    context: getSiteContext("en"),
    expectedLang: "en",
  },
  {
    locale: "es" as const,
    rootRoute: "/es",
    context: getSiteContext("es"),
    expectedLang: "es",
  },
];

function getExpectedSectionRoute(rootRoute: string, sectionId: string) {
  return rootRoute === "/" ? `/${sectionId}` : `${rootRoute}/${sectionId}`;
}

for (const { locale, rootRoute, context, expectedLang } of locales) {
  test(`${locale} home page header exposes expected navigation links`, async ({
    page,
  }) => {
    await page.goto(rootRoute);
    await page.waitForLoadState("networkidle");

    const primaryNav = page.getByRole("navigation", {
      name: getPrimaryNavigationLabel(locale),
    });
    const homeLabel = context.navigationItems[0]?.label;
    const localeSwitcherHref = locale === "en" ? "/es" : "/";

    await expect(
      primaryNav.getByRole("link", { name: homeLabel! }),
    ).toHaveAttribute("href", rootRoute);

    for (const section of context.enabledPageSections) {
      await expect(
        primaryNav.getByRole("link", { name: section.navLabel, exact: true }),
      ).toHaveAttribute("href", getExpectedSectionRoute(rootRoute, section.id));
    }

    await expect(
      primaryNav.getByRole("link", {
        name: locale === "en" ? /Espanol/i : /English/i,
      }),
    ).toHaveAttribute("href", localeSwitcherHref);
  });

  test(`${locale} routes are reachable from the home page`, async ({
    page,
  }) => {
    await page.goto(rootRoute);
    await page.waitForLoadState("networkidle");
    const primaryNav = page.getByRole("navigation", {
      name: getPrimaryNavigationLabel(locale),
    });
    await expect(page.locator("html")).toHaveAttribute("lang", expectedLang);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: context.homeSection.hero.headline,
      }),
    ).toBeVisible();

    for (const section of context.enabledPageSections) {
      const expectedSectionRoute = getExpectedSectionRoute(
        rootRoute,
        section.id,
      );

      await primaryNav
        .getByRole("link", { name: section.navLabel, exact: true })
        .click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(new RegExp(`${expectedSectionRoute}$`));
      await expect(
        page.getByRole("heading", { level: 1, name: section.intro.title }),
      ).toBeVisible();

      await page.goto(rootRoute);
      await page.waitForLoadState("networkidle");
    }
  });

  test(`${locale} section routes are reachable directly`, async ({ page }) => {
    for (const section of context.enabledPageSections) {
      const expectedSectionRoute = getExpectedSectionRoute(
        rootRoute,
        section.id,
      );

      await page.goto(expectedSectionRoute);
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL(new RegExp(`${expectedSectionRoute}$`));
      await expect(page.locator("html")).toHaveAttribute("lang", expectedLang);
      await expect(
        page.getByRole("heading", { level: 1, name: section.intro.title }),
      ).toBeVisible();
    }
  });
}

test("english home page publishes production metadata and a direct contact CTA", async ({
  page,
}) => {
  const englishSiteContext = getSiteContext("en");

  await page.goto("/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${defaultSiteUrl}/`,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute("href", `${defaultSiteUrl}/es`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `${defaultSiteUrl}/og-preview.png`,
  );
  await expect(
    page.getByRole("link", {
      name: englishSiteContext.homeSection.hero.primaryCta.label,
    }),
  ).toHaveAttribute(
    "href",
    `mailto:${englishSiteContext.siteData.person.email}`,
  );
});

test("spanish home page publishes localized metadata and preserves alternate links", async ({
  page,
}) => {
  const spanishSiteContext = getSiteContext("es");

  await page.goto("/es");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${defaultSiteUrl}/es`,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", `${defaultSiteUrl}/`);
  await expect(
    page.getByRole("link", {
      name: spanishSiteContext.homeSection.hero.primaryCta.label,
    }),
  ).toHaveAttribute(
    "href",
    `mailto:${spanishSiteContext.siteData.person.email}`,
  );
});

test("localized pages keep public asset links at the site root", async ({
  page,
}) => {
  await page.goto("/es");

  await expect(
    page.getByRole("link", { name: "CV", exact: true }),
  ).toHaveAttribute("href", "/gerardo-vitale-cv-2026-03.pdf");
});

test("language switcher preserves the current section", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("link", { name: /Espanol/i }).click();

  await expect(page).toHaveURL(/\/es\/projects$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  await page.getByRole("link", { name: /English/i }).click();

  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("404 page does not advertise untranslated alternates", async ({
  page,
}) => {
  await page.goto("/missing-route");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${defaultSiteUrl}/404`,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Espanol/i })).toHaveCount(0);
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
