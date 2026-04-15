import {
  getLocaleInfoFromPathname,
  localizeHref,
  localizePath,
} from "./locale";

describe("locale helpers", () => {
  it("extracts locale prefixes from pathnames", () => {
    expect(getLocaleInfoFromPathname("/")).toEqual({
      locale: "en",
      pathname: "/",
    });
    expect(getLocaleInfoFromPathname("/es/projects/")).toEqual({
      locale: "es",
      pathname: "/projects",
    });
  });

  it("localizes internal routes without touching external hrefs", () => {
    expect(localizePath("/", "es")).toBe("/es");
    expect(localizePath("/projects", "es")).toBe("/es/projects");
    expect(localizePath("/es/projects", "en")).toBe("/projects");
    expect(localizeHref("mailto:test@example.com", "es")).toBe(
      "mailto:test@example.com",
    );
    expect(localizeHref("https://example.com", "es")).toBe(
      "https://example.com",
    );
  });
});
