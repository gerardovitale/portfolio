import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { enabledPageSections } from "../src/data/site";

for (const route of [
  "/",
  ...enabledPageSections.map((section) => `/${section.id}`),
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
