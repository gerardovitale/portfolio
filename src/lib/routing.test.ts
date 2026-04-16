import {
  getAnchorSectionIdFromHref,
  getLocalizedSectionHref,
  localizeContentHref,
  makeExperienceEntryId,
  normalizePath,
} from "./routing";

describe("normalizePath", () => {
  it("keeps the home route stable", () => {
    expect(normalizePath("/")).toBe("/");
  });

  it("removes trailing slashes from subroutes", () => {
    expect(normalizePath("/projects/")).toBe("/projects");
    expect(normalizePath("/experience///")).toBe("/experience");
  });
});

describe("makeExperienceEntryId", () => {
  it("stays unique for repeated employers", () => {
    const sharedEntry = {
      company: "Acme",
      role: "Data Engineer",
      period: "2025",
      location: "Remote",
      summary: "Built things",
      achievements: ["A", "B"],
    };

    expect(makeExperienceEntryId(sharedEntry, 0)).not.toBe(
      makeExperienceEntryId(sharedEntry, 1),
    );
  });
});

describe("section anchor helpers", () => {
  it("builds localized section hrefs", () => {
    expect(getLocalizedSectionHref("home", "en")).toBe("/#home");
    expect(getLocalizedSectionHref("projects", "es")).toBe("/es#projects");
  });

  it("recognizes legacy section routes", () => {
    expect(getAnchorSectionIdFromHref("/projects")).toBe("projects");
    expect(getAnchorSectionIdFromHref("/es/experience")).toBe("experience");
    expect(getAnchorSectionIdFromHref("/")).toBeNull();
  });

  it("rewrites localized section routes to anchors without touching public assets", () => {
    expect(localizeContentHref("/projects", "en")).toBe("/#projects");
    expect(localizeContentHref("/projects", "es")).toBe("/es#projects");
    expect(
      localizeContentHref("/gerardo-vitale-cv-2026-03.pdf", "es", false),
    ).toBe("/gerardo-vitale-cv-2026-03.pdf");
  });
});
