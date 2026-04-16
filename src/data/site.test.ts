import {
  buildNavigationItems,
  getEnabledPageSections,
  getSiteContext,
  getSiteData,
  getThemeCssVariables,
  projectStatuses,
  siteSchema,
} from "./site";

const englishSiteContext = getSiteContext("en");
const spanishSiteContext = getSiteContext("es");
const siteData = englishSiteContext.siteData;
const homeSection = englishSiteContext.homeSection;
const navigationItems = englishSiteContext.navigationItems;
const allProjectTags = englishSiteContext.allProjectTags;
const themeCssVariables = getThemeCssVariables(siteData);

describe("siteData", () => {
  it("keeps route content structurally valid", () => {
    expect(siteData.person.name).toBeTruthy();
    expect(siteData.person.fullName).toBe("Gerardo Vitale Errico");
    expect(homeSection.id).toBe("home");
    expect(navigationItems.some((item) => item.id === "home")).toBe(true);
    expect(siteData.sections.some((section) => section.id === "home")).toBe(
      true,
    );
  });

  it("uses only supported project statuses", () => {
    const statuses = new Set(projectStatuses);
    const projectsSection = siteData.sections.find(
      (section) => section.id === "projects",
    );

    for (const project of projectsSection?.projects ?? []) {
      expect(statuses.has(project.status)).toBe(true);
    }
  });

  it("derives unique project tags", () => {
    expect(allProjectTags).toEqual([...new Set(allProjectTags)]);
  });

  it("keeps current project slugs unique", () => {
    const projectsSection = siteData.sections.find(
      (section) => section.id === "projects",
    );
    const slugs =
      projectsSection?.projects.map((project) => project.slug) ?? [];

    expect(slugs).toEqual([...new Set(slugs)]);
  });

  it("maps theme tokens to css variables", () => {
    expect(themeCssVariables["--color-accent"]).toBe(
      siteData.theme.palette.accent,
    );
    expect(themeCssVariables["--font-body"]).toBe(siteData.theme.fonts.body);
  });

  it("requires the home section in config", () => {
    const configWithoutHome = structuredClone(siteData);
    configWithoutHome.sections = configWithoutHome.sections.filter(
      (section) => section.id !== "home",
    );

    expect(() => siteSchema.parse(configWithoutHome)).toThrow(/home/);
  });

  it("omits disabled sections from derived navigation", () => {
    const configWithDisabledInterests = structuredClone(siteData);
    configWithDisabledInterests.sections =
      configWithDisabledInterests.sections.map((section) =>
        section.id === "interests" ? { ...section, enabled: false } : section,
      );

    const parsedConfig = siteSchema.parse(configWithDisabledInterests);
    const navItems = buildNavigationItems(parsedConfig.sections);
    const pageSections = getEnabledPageSections(parsedConfig.sections);

    expect(navItems.map((item) => item.id)).not.toContain("interests");
    expect(pageSections.map((section) => section.id)).not.toContain(
      "interests",
    );
  });

  it("allows a home-only portfolio config", () => {
    const homeOnlyConfig = structuredClone(siteData);
    homeOnlyConfig.sections = homeOnlyConfig.sections.filter(
      (section) => section.id === "home",
    );
    const homeOnlySection = homeOnlyConfig.sections.find(
      (section) => section.id === "home",
    );

    if (!homeOnlySection || homeOnlySection.id !== "home") {
      throw new Error("Expected home section in site config.");
    }

    homeOnlySection.hero.secondaryCta.href = "/";

    const parsedConfig = siteSchema.parse(homeOnlyConfig);
    const navItems = buildNavigationItems(parsedConfig.sections);
    const pageSections = getEnabledPageSections(parsedConfig.sections);

    expect(navItems.map((item) => item.id)).toEqual(["home"]);
    expect(pageSections).toEqual([]);
  });

  it("rejects duplicate project slugs", () => {
    const configWithDuplicateSlug = structuredClone(siteData);
    const projectsSection = configWithDuplicateSlug.sections.find(
      (section) => section.id === "projects",
    );

    if (!projectsSection) {
      throw new Error("Expected projects section in site config.");
    }

    projectsSection.projects[1] = {
      ...projectsSection.projects[1],
      slug: projectsSection.projects[0]?.slug ?? "fuel-precision",
    };

    expect(() => siteSchema.parse(configWithDuplicateSlug)).toThrow(/slug/);
  });

  it("rejects internal project links that point to unknown routes", () => {
    const configWithBrokenInternalLink = structuredClone(siteData);
    const projectsSection = configWithBrokenInternalLink.sections.find(
      (section) => section.id === "projects",
    );

    if (!projectsSection) {
      throw new Error("Expected projects section in site config.");
    }

    projectsSection.projects[0] = {
      ...projectsSection.projects[0],
      links: [
        {
          label: "Broken route",
          href: "/home",
          external: false,
          localized: true,
        },
      ],
    };

    expect(() => siteSchema.parse(configWithBrokenInternalLink)).toThrow(
      /enabled portfolio route/i,
    );
  });

  it("requires featured projects to expose at least one external proof link", () => {
    const configWithoutProofLink = structuredClone(siteData);
    const projectsSection = configWithoutProofLink.sections.find(
      (section) => section.id === "projects",
    );

    if (!projectsSection) {
      throw new Error("Expected projects section in site config.");
    }

    projectsSection.projects[0] = {
      ...projectsSection.projects[0],
      status: "featured",
      links: [
        {
          label: "Internal only",
          href: "/projects",
          external: false,
          localized: true,
        },
      ],
    };

    expect(() => siteSchema.parse(configWithoutProofLink)).toThrow(
      /external proof link/i,
    );
  });

  it("does not ship the placeholder site URL in the live config", () => {
    expect(siteData.seo.siteUrl).toBe("https://gerardo-vitale.com");
  });

  it("loads localized Spanish content and hrefs", () => {
    expect(getSiteData("es").seo.title).toContain(
      "Data Engineer & Backend Developer",
    );
    expect(spanishSiteContext.navigationItems[0]?.href).toBe("/es#home");
    expect(
      spanishSiteContext.navigationItems.some(
        (item) => item.href === "/es#projects" && item.label === "Proyectos",
      ),
    ).toBe(true);
  });

  it("allows explicit non-localized links to public assets", () => {
    const configWithAssetLink = structuredClone(siteData);

    configWithAssetLink.person.socialLinks.push({
      label: "Asset",
      href: "/gerardo-vitale-cv-2026-03.pdf",
      external: false,
      localized: false,
    });

    expect(() => siteSchema.parse(configWithAssetLink)).not.toThrow();
  });

  it("rejects non-localized asset links when the public file does not exist", () => {
    const configWithBrokenAssetLink = structuredClone(siteData);

    configWithBrokenAssetLink.person.socialLinks.push({
      label: "Broken asset",
      href: "/gerardo-vitale-cv-2026-30.pdf",
      external: false,
      localized: false,
    });

    expect(() => siteSchema.parse(configWithBrokenAssetLink)).toThrow(
      /existing file under public/i,
    );
  });

  it("accepts an empty siteUrl to defer to PUBLIC_SITE_URL", () => {
    const configWithEmptySiteUrl = structuredClone(siteData);
    configWithEmptySiteUrl.seo.siteUrl = "";

    expect(() => siteSchema.parse(configWithEmptySiteUrl)).not.toThrow();
  });
});
