import {
  allProjectTags,
  buildNavigationItems,
  getEnabledPageSections,
  homeSection,
  navigationItems,
  projectStatuses,
  siteSchema,
  siteData,
  themeCssVariables,
} from "./site";

describe("siteData", () => {
  it("keeps route content structurally valid", () => {
    expect(siteData.person.name).toBeTruthy();
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

    const parsedConfig = siteSchema.parse(homeOnlyConfig);
    const navItems = buildNavigationItems(parsedConfig.sections);
    const pageSections = getEnabledPageSections(parsedConfig.sections);

    expect(navItems.map((item) => item.id)).toEqual(["home"]);
    expect(pageSections).toEqual([]);
  });
});
