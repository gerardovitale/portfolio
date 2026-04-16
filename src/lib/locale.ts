export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const basePath = pathname.split(/[?#]/, 1)[0] ?? pathname;
  const normalized = basePath.startsWith("/")
    ? basePath
    : `/${basePath.replace(/^\/+/, "")}`;

  if (normalized.length <= 1) {
    return "/";
  }

  return normalized.replace(/\/+$/, "");
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocalePrefix(locale: Locale) {
  return locale === defaultLocale ? "" : `/${locale}`;
}

export function getLocaleName(locale: Locale) {
  return locale === "en" ? "English" : "Español";
}

export function getLocaleCode(locale: Locale) {
  return locale === "en" ? "EN" : "ES";
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

export function getLanguageSwitcherLabel(locale: Locale) {
  return locale === "en" ? "Change language" : "Cambiar idioma";
}

export function getPrimaryNavigationLabel(locale: Locale) {
  return locale === "en" ? "Primary navigation" : "Navegación principal";
}

export function getOpenNavigationMenuLabel(locale: Locale) {
  return locale === "en" ? "Open navigation menu" : "Abrir menú de navegación";
}

export function getCloseNavigationMenuLabel(locale: Locale) {
  return locale === "en"
    ? "Close navigation menu"
    : "Cerrar menú de navegación";
}

export function getLocaleInfoFromPathname(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const [, firstSegment, ...remainingSegments] = normalizedPath.split("/");

  if (firstSegment && isLocale(firstSegment)) {
    return {
      locale: firstSegment,
      pathname:
        remainingSegments.length === 0
          ? "/"
          : `/${remainingSegments.join("/")}`,
    };
  }

  return {
    locale: defaultLocale,
    pathname: normalizedPath,
  };
}

export function localizePath(pathname: string, locale: Locale) {
  const { pathname: basePath } = getLocaleInfoFromPathname(pathname);
  const prefix = getLocalePrefix(locale);

  if (basePath === "/") {
    return prefix || "/";
  }

  return `${prefix}${basePath}`;
}

export function localizeHref(
  href: string,
  locale: Locale,
  shouldLocalize = true,
) {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }

  if (!shouldLocalize) {
    return href;
  }

  return localizePath(href, locale);
}
