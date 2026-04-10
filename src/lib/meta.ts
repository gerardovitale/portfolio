import { siteData } from "../data/site";

const envSiteUrl = import.meta.env?.PUBLIC_SITE_URL?.trim();
export const exampleSiteUrl = "https://portfolio.example.com";
export const defaultSocialImagePath = "/og-preview.png";
export const defaultSiteUrl = (
  envSiteUrl ||
  siteData.seo.siteUrl ||
  exampleSiteUrl
).replace(/\/+$/, "");
export const defaultSocialImageUrl = new URL(
  defaultSocialImagePath,
  defaultSiteUrl,
).toString();

export function makePageTitle(title?: string) {
  if (!title) {
    return siteData.seo.title;
  }

  return `${title} | ${siteData.person.name}`;
}

export function getCanonicalUrl(pathname: string) {
  return new URL(pathname, defaultSiteUrl).toString();
}

export function buildStructuredData({
  title,
  description,
  pathname,
}: {
  title?: string;
  description: string;
  pathname: string;
}) {
  const pageTitle = makePageTitle(title);
  const canonicalUrl = getCanonicalUrl(pathname);
  const sameAs = siteData.person.socialLinks
    .filter((link) => link.external && link.href.startsWith("http"))
    .map((link) => link.href);

  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${defaultSiteUrl}#person`,
      name: siteData.person.name,
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
