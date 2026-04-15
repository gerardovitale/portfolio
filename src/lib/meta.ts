import {
  defaultLocale,
  getLocaleInfoFromPathname,
  localizePath,
  locales,
} from "./locale";
import { getSiteData, type SiteData } from "../data/site";

const envSiteUrl = import.meta.env?.PUBLIC_SITE_URL?.trim();
const defaultSiteData = getSiteData(defaultLocale);

export const exampleSiteUrl = "https://portfolio.example.com";
export const defaultSocialImagePath = "/og-preview.png";
export const defaultSiteUrl = (
  envSiteUrl ||
  defaultSiteData.seo.siteUrl ||
  exampleSiteUrl
).replace(/\/+$/, "");
export const defaultSocialImageUrl = new URL(
  defaultSocialImagePath,
  defaultSiteUrl,
).toString();

export function makePageTitle(siteData: SiteData, title?: string) {
  if (!title) {
    return siteData.seo.title;
  }

  return `${title} | ${siteData.person.name}`;
}

function normalizeCanonicalPathname(pathname: string) {
  const basePath = pathname.split(/[?#]/, 1)[0] ?? pathname;

  if (basePath.length <= 1) {
    return "/";
  }

  return basePath.replace(/\/+$/, "");
}

export function getCanonicalUrl(pathname: string) {
  return new URL(
    normalizeCanonicalPathname(pathname),
    defaultSiteUrl,
  ).toString();
}

export function getAlternateLanguageUrls(pathname: string) {
  const { pathname: basePath } = getLocaleInfoFromPathname(pathname);

  return locales.map((locale) => ({
    locale,
    href: getCanonicalUrl(localizePath(basePath, locale)),
  }));
}

export function getDefaultLanguageUrl(pathname: string) {
  const { pathname: basePath } = getLocaleInfoFromPathname(pathname);

  return getCanonicalUrl(localizePath(basePath, defaultLocale));
}

export function buildStructuredData({
  siteData,
  title,
  description,
  pathname,
}: {
  siteData: SiteData;
  title?: string;
  description: string;
  pathname: string;
}) {
  const pageTitle = makePageTitle(siteData, title);
  const canonicalUrl = getCanonicalUrl(pathname);
  const sameAs = siteData.person.socialLinks
    .filter((link) => link.external && link.href.startsWith("http"))
    .map((link) => link.href);

  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${defaultSiteUrl}#person`,
      name: siteData.person.fullName ?? siteData.person.name,
      alternateName: siteData.person.fullName
        ? siteData.person.name
        : undefined,
      jobTitle: siteData.person.role,
      description: siteData.person.intro,
      email: `mailto:${siteData.person.email}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteData.person.location,
      },
      url: defaultSiteUrl,
      sameAs,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${defaultSiteUrl}#website`,
      name: siteData.seo.title,
      url: defaultSiteUrl,
      description: siteData.seo.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: pageTitle,
      description,
      isPartOf: {
        "@id": `${defaultSiteUrl}#website`,
      },
      about: {
        "@id": `${defaultSiteUrl}#person`,
      },
      primaryImageOfPage: defaultSocialImageUrl,
    },
  ]);
}
