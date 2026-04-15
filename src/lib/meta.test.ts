import { getSiteData } from "../data/site";
import {
  buildStructuredData,
  defaultSiteUrl,
  getAlternateLanguageUrls,
  getCanonicalUrl,
  getDefaultLanguageUrl,
} from "./meta";

const englishSiteData = getSiteData("en");
const spanishSiteData = getSiteData("es");

describe("meta helpers", () => {
  it("builds canonical URLs from the configured production origin", () => {
    expect(defaultSiteUrl).toBe("https://gerardo-vitale.com");
    expect(getCanonicalUrl("/projects")).toBe(
      "https://gerardo-vitale.com/projects",
    );
    expect(getCanonicalUrl("/es/projects")).toBe(
      "https://gerardo-vitale.com/es/projects",
    );
  });

  it("includes webpage structured data for the current route", () => {
    const payload = buildStructuredData({
      siteData: englishSiteData,
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

  it("uses the formal full name in person structured data when configured", () => {
    const payload = buildStructuredData({
      siteData: englishSiteData,
      description: englishSiteData.seo.description,
      pathname: "/",
    });
    const parsed = JSON.parse(payload) as Array<{
      "@type": string;
      name?: string;
      alternateName?: string;
    }>;
    const personEntry = parsed.find((entry) => entry["@type"] === "Person");

    expect(personEntry).toMatchObject({
      name: "Gerardo Vitale Errico",
      alternateName: "Gerardo Vitale",
    });
  });

  it("builds locale alternates for translated routes", () => {
    expect(getAlternateLanguageUrls("/es/projects")).toEqual([
      { locale: "en", href: "https://gerardo-vitale.com/projects" },
      { locale: "es", href: "https://gerardo-vitale.com/es/projects" },
    ]);
    expect(getDefaultLanguageUrl("/es/projects")).toBe(
      "https://gerardo-vitale.com/projects",
    );
  });

  it("uses localized site data in structured metadata", () => {
    const payload = buildStructuredData({
      siteData: spanishSiteData,
      title: "Proyectos",
      description: "Trabajo seleccionado.",
      pathname: "/es/projects",
    });
    const parsed = JSON.parse(payload) as Array<{
      "@type": string;
      description?: string;
      url?: string;
    }>;

    expect(
      parsed.some(
        (entry) =>
          entry["@type"] === "WebPage" &&
          entry.url === "https://gerardo-vitale.com/es/projects" &&
          entry.description === "Trabajo seleccionado.",
      ),
    ).toBe(true);
  });
});
