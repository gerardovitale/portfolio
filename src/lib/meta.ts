export const defaultSiteUrl =
  import.meta.env.PUBLIC_SITE_URL ?? "https://portfolio.example.com";

export function makePageTitle(title?: string) {
  if (!title) {
    return "Gerardo Vitale | Data Engineer";
  }

  return `${title} | Gerardo Vitale`;
}
