import { buildStructuredData, defaultSiteUrl, getCanonicalUrl } from "./meta";

describe("meta helpers", () => {
  it("builds canonical URLs from the configured production origin", () => {
    expect(defaultSiteUrl).toBe("https://gerardo-vitale.com");
    expect(getCanonicalUrl("/projects")).toBe(
      "https://gerardo-vitale.com/projects",
    );
  });

  it("includes webpage structured data for the current route", () => {
    const payload = buildStructuredData({
      title: "Projects",
      description: "Selected work.",
      pathname: "/projects",
    });
    const parsed = JSON.parse(payload) as Array<{
      "@type": string;
      url?: string;
    }>;

    expect(parsed.some((entry) => entry["@type"] === "Person")).toBe(true);
    expect(
      parsed.some(
        (entry) =>
          entry["@type"] === "WebPage" &&
          entry.url === "https://gerardo-vitale.com/projects",
      ),
    ).toBe(true);
  });
});
