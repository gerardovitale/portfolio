import { makeExperienceEntryId, normalizePath } from "./routing";

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
