import {
  defaultLocale,
  getLocaleInfoFromPathname,
  localizeHref,
  localizePath,
  type Locale,
} from "./locale";
import type { ExperienceEntry } from "../data/site";

const sectionRouteToId = {
  "/projects": "projects",
  "/experience": "experience",
  "/interests": "interests",
} as const;

export type AnchorSectionId =
  | "home"
  | (typeof sectionRouteToId)[keyof typeof sectionRouteToId];

export function normalizePath(path: string) {
  if (path.length <= 1) {
    return "/";
  }

  return path.replace(/\/+$/, "");
}

export function getLocalizedSectionHref(
  sectionId: AnchorSectionId,
  locale: Locale = defaultLocale,
) {
  return `${localizePath("/", locale)}#${sectionId}`;
}

export function getAnchorSectionIdFromHref(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return null;
  }

  const { pathname } = getLocaleInfoFromPathname(href);
  const normalizedPath = normalizePath(pathname);

  return (
    sectionRouteToId[normalizedPath as keyof typeof sectionRouteToId] ?? null
  );
}

export function localizeContentHref(
  href: string,
  locale: Locale,
  shouldLocalize = true,
) {
  if (!shouldLocalize) {
    return href;
  }

  const sectionId = getAnchorSectionIdFromHref(href);

  if (sectionId) {
    return getLocalizedSectionHref(sectionId, locale);
  }

  return localizeHref(href, locale, shouldLocalize);
}

export function makeExperienceEntryId(entry: ExperienceEntry, index: number) {
  const base = `${entry.company}-${entry.role}-${entry.period}-${index}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-panel`;
}
