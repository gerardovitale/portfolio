import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getSiteContext } from "../src/data/site";

const englishSiteContext = getSiteContext("en");
const spanishSiteContext = getSiteContext("es");

for (const route of [
  "/",
  ...englishSiteContext.enabledPageSections.map((section) => `/${section.id}`),
  "/es",
  ...spanishSiteContext.enabledPageSections.map(
    (section) => `/es/${section.id}`,
  ),
]) {
  test(`route ${route} has no critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page }).analyze();
    const criticalViolations = results.violations.filter(
      (violation) => violation.impact === "critical",
    );

    expect(criticalViolations).toEqual([]);
  });
}
