import type { ExperienceEntry } from "../data/site";

export function normalizePath(path: string) {
  if (path.length <= 1) {
    return "/";
  }

  return path.replace(/\/+$/, "");
}

export function makeExperienceEntryId(entry: ExperienceEntry, index: number) {
  const base = `${entry.company}-${entry.role}-${entry.period}-${index}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-panel`;
}
