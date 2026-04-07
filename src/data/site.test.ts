import { allProjectTags, projectStatuses, siteData } from "./site";

describe("siteData", () => {
  it("keeps route content structurally valid", () => {
    expect(siteData.person.name).toBeTruthy();
    expect(siteData.projects).toHaveLength(3);
    expect(siteData.experience.length).toBeGreaterThanOrEqual(3);
    expect(siteData.skillGroups.length).toBeGreaterThanOrEqual(3);
  });

  it("uses only supported project statuses", () => {
    const statuses = new Set(projectStatuses);

    for (const project of siteData.projects) {
      expect(statuses.has(project.status)).toBe(true);
    }
  });

  it("derives unique project tags", () => {
    expect(allProjectTags).toEqual([...new Set(allProjectTags)]);
    expect(allProjectTags.length).toBeGreaterThan(4);
  });
});
