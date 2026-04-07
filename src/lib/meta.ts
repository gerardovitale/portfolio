import { siteData } from "../data/site";

const envSiteUrl = import.meta.env.PUBLIC_SITE_URL?.trim();

export const defaultSiteUrl =
  (envSiteUrl || siteData.seo.siteUrl) ?? "https://portfolio.example.com";

export function makePageTitle(title?: string) {
  if (!title) {
    return siteData.seo.title;
  }

  return `${title} | ${siteData.person.name}`;
}
