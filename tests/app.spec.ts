import { expect, test, type Page } from "@playwright/test";
import { getSiteContext } from "../src/data/site";
import {
  getCloseNavigationMenuLabel,
  getOpenNavigationMenuLabel,
  getPrimaryNavigationLabel,
} from "../src/lib/locale";
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

function isMobileProject() {
  return test.info().project.name === "mobile";
}

async function openNavigationMenu(page: Page, locale: "en" | "es") {
  if (!isMobileProject()) {
    return;
  }

  const menuToggle = page.locator("[data-mobile-nav-toggle]");
  const hiddenPrimaryNav = page.getByRole("navigation", {
    name: getPrimaryNavigationLabel(locale),
    includeHidden: true,
  });

  await expect(menuToggle).toBeVisible();
  await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
  await expect(menuToggle).toHaveAttribute(
    "aria-label",
    getOpenNavigationMenuLabel(locale),
  );
  await expect(hiddenPrimaryNav).toBeHidden();

  await menuToggle.click();

  await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
  await expect(menuToggle).toHaveAttribute(
    "aria-label",
    getCloseNavigationMenuLabel(locale),
  );
  await expect(
    page.getByRole("navigation", {
      name: getPrimaryNavigationLabel(locale),
    }),
  ).toBeVisible();
}

for (const { locale, rootRoute, context, expectedLang } of locales) {
  test(`${locale} home page header exposes expected navigation links`, async ({
    page,
  }) => {
    await page.goto(rootRoute);
    await page.waitForLoadState("networkidle");

    const menuToggle = page.locator("[data-mobile-nav-toggle]");
    const homeLabel = context.navigationItems[0]?.label;
    const localeSwitcherHref = locale === "en" ? "/es" : "/";

    if (isMobileProject()) {
      await openNavigationMenu(page, locale);
    } else {
      await expect(menuToggle).toBeHidden();
    }

    const primaryNav = page.getByRole("navigation", {
      name: getPrimaryNavigationLabel(locale),
    });

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
        name: locale === "en" ? /Español/i : /English/i,
      }),
    ).toHaveAttribute("href", localeSwitcherHref);
  });

  test(`${locale} routes are reachable from the home page`, async ({
    page,
  }) => {
    await page.goto(rootRoute);
    await page.waitForLoadState("networkidle");

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

      await openNavigationMenu(page, locale);

      const primaryNav = page.getByRole("navigation", {
        name: getPrimaryNavigationLabel(locale),
      });

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
    page.locator('link[rel="icon"][type="image/svg+xml"]'),
  ).toHaveAttribute("href", "/favicon.svg");
  await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute(
    "href",
    "/favicon-32x32.png",
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/apple-touch-icon.png",
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/site.webmanifest",
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
    page.locator('link[rel="icon"][type="image/svg+xml"]'),
  ).toHaveAttribute("href", "/favicon.svg");
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
  request,
}) => {
  const englishSiteContext = getSiteContext("en");

  await page.goto("/es");

  await expect(
    page.getByRole("link", { name: "CV", exact: true }),
  ).toHaveAttribute("href", "/gerardo-vitale-cv-2026-03.pdf");

  const faviconResponse = await request.get("/favicon.svg");
  expect(faviconResponse.ok()).toBeTruthy();
  expect(faviconResponse.headers()["content-type"]).toContain("image/svg+xml");

  const manifestResponse = await request.get("/site.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  expect(manifestResponse.headers()["content-type"]).toContain(
    "application/manifest+json",
  );
  const manifest = (await manifestResponse.json()) as {
    name: string;
    short_name: string;
    theme_color: string;
  };

  expect(manifest).toMatchObject({
    name: englishSiteContext.siteData.person.name,
    short_name: englishSiteContext.siteData.person.brandMark,
    theme_color:
      englishSiteContext.siteData.theme.themeColor ??
      englishSiteContext.siteData.theme.palette.accent,
  });
});

test("language switcher preserves the current section", async ({ page }) => {
  await page.goto("/projects");
  await openNavigationMenu(page, "en");
  await page.getByRole("link", { name: /Español/i }).click();

  await expect(page).toHaveURL(/\/es\/projects$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  await openNavigationMenu(page, "es");
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
  await expect(page.getByRole("link", { name: /Español/i })).toHaveCount(0);
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
