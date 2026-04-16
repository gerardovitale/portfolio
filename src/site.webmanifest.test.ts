import { getSiteData } from "./data/site";
import { GET, prerender } from "./pages/site.webmanifest";

describe("site.webmanifest route", () => {
  it("is prerendered", () => {
    expect(prerender).toBe(true);
  });

  it("derives branding metadata from site config", async () => {
    const siteData = getSiteData();
    const response = await GET({} as Parameters<typeof GET>[0]);
    const manifest = (await response.json()) as {
      name: string;
      short_name: string;
      theme_color: string;
      background_color: string;
    };

    expect(response.headers.get("content-type")).toBe(
      "application/manifest+json; charset=utf-8",
    );
    expect(manifest).toMatchObject({
      name: siteData.person.name,
      short_name: siteData.person.brandMark,
      theme_color: siteData.theme.themeColor ?? siteData.theme.palette.accent,
      background_color: siteData.theme.palette.background,
    });
  });
});
