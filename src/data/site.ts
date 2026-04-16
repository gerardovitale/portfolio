import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { parse } from "yaml";
import { defaultLocale, localizePath, type Locale } from "../lib/locale";
import { getLocalizedSectionHref } from "../lib/routing";

const siteUrlSchema = z
  .string()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  external: z.boolean().default(false),
  localized: z.boolean().default(true),
});

const statSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  detail: z.string().min(1),
});

const principleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const projectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(["featured", "live", "exploration"]),
  year: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)).min(1),
  links: z.array(linkSchema).min(1),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  location: z.string().min(1),
  summary: z.string().min(1),
  achievements: z.array(z.string().min(1)).min(1),
});

const skillGroupSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

const interestSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
});

const pageIntroSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const sectionHeadingSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
});

const homeCardSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const projectInteractionSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  searchLabel: z.string().min(1),
  searchPlaceholder: z.string().min(1),
  statusToolbarLabel: z.string().min(1),
  statusLabels: z.object({
    all: z.string().min(1),
    featured: z.string().min(1),
    live: z.string().min(1),
    exploration: z.string().min(1),
  }),
  resultsPrefix: z.string().min(1),
  resultNounSingular: z.string().min(1),
  resultNounPlural: z.string().min(1),
});

const uiSchema = z.object({
  footer: z.object({
    contactHeading: z.string().min(1),
    profilesHeading: z.string().min(1),
  }),
});

const homeSectionSchema = z.object({
  id: z.literal("home"),
  navLabel: z.string().min(1),
  hero: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    intro: z.string().min(1),
    missionLabel: z.string().min(1),
    mission: z.string().min(1),
    availability: z.string().min(1),
    primaryCta: z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    }),
    secondaryCta: z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    }),
    supportNote: z.string().min(1),
  }),
  stats: z.array(statSchema).min(1),
  principlesIntro: sectionHeadingSchema,
  principles: z.array(principleSchema).min(1),
});

const projectsSectionSchema = z.object({
  id: z.literal("projects"),
  enabled: z.boolean().default(true),
  navLabel: z.string().min(1),
  intro: pageIntroSchema,
  homeCard: homeCardSchema,
  interaction: projectInteractionSchema,
  projects: z.array(projectSchema).min(1),
});

const experienceSectionSchema = z.object({
  id: z.literal("experience"),
  enabled: z.boolean().default(true),
  navLabel: z.string().min(1),
  intro: pageIntroSchema,
  homeCard: homeCardSchema,
  timeline: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  entries: z.array(experienceSchema).min(1),
});

const interestsSectionSchema = z.object({
  id: z.literal("interests"),
  enabled: z.boolean().default(true),
  navLabel: z.string().min(1),
  intro: pageIntroSchema,
  homeCard: homeCardSchema,
  skillsHeading: sectionHeadingSchema,
  skillGroups: z.array(skillGroupSchema).min(1),
  interestsHeading: sectionHeadingSchema,
  interests: z.array(interestSchema).min(1),
  nowHeading: sectionHeadingSchema,
  now: z.array(z.string().min(1)).min(1),
});

const siteSectionSchema = z.discriminatedUnion("id", [
  homeSectionSchema,
  projectsSectionSchema,
  experienceSectionSchema,
  interestsSectionSchema,
]);

const sectionRegistry = {
  home: {
    id: "home",
    route: "/",
    required: true,
  },
  projects: {
    id: "projects",
    route: "/projects",
    required: false,
  },
  experience: {
    id: "experience",
    route: "/experience",
    required: false,
  },
  interests: {
    id: "interests",
    route: "/interests",
    required: false,
  },
} as const;

const hexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
const rgbaColorSchema = z
  .string()
  .regex(/^rgba?\([^)]+\)$/)
  .or(hexColorSchema);

function isMailtoHref(href: string) {
  return href.startsWith("mailto:");
}

function isAbsoluteWebHref(href: string) {
  try {
    const url = new URL(href);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeInternalHref(href: string) {
  const pathname = href.split(/[?#]/, 1)[0] ?? href;

  if (pathname.length <= 1) {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}

function isKnownInternalHref(href: string, enabledRoutes: Set<string>) {
  return href.startsWith("/") && !href.startsWith("//")
    ? enabledRoutes.has(normalizeInternalHref(href))
    : false;
}

function publicAssetExists(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return false;
  }

  const pathname = href.split(/[?#]/, 1)[0] ?? href;
  const publicAssetPath = resolve(
    process.cwd(),
    "public",
    pathname.replace(/^\/+/, ""),
  );

  return existsSync(publicAssetPath);
}

function validateConfiguredLink(
  link: { href: string; external: boolean; localized: boolean },
  ctx: z.RefinementCtx,
  path: Array<string | number>,
  enabledRoutes: Set<string>,
) {
  if (link.external) {
    if (!isAbsoluteWebHref(link.href)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'External links must use an absolute "http" or "https" URL.',
        path,
      });
    }

    return;
  }

  if (isMailtoHref(link.href)) {
    return;
  }

  if (!link.localized) {
    if (!publicAssetExists(link.href)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Non-localized internal links must point to an existing file under public/.",
        path,
      });
    }

    return;
  }

  if (!isKnownInternalHref(link.href, enabledRoutes)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Internal links must target an enabled portfolio route or use mailto:.",
      path,
    });
  }
}

function validateActionHref(
  href: string,
  ctx: z.RefinementCtx,
  path: Array<string | number>,
  enabledRoutes: Set<string>,
) {
  if (isMailtoHref(href)) {
    return;
  }

  if (!isKnownInternalHref(href, enabledRoutes)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "CTA links must target an enabled portfolio route or use mailto:.",
      path,
    });
  }
}

export const siteSchema = z
  .object({
    person: z.object({
      name: z.string().min(1),
      fullName: z.string().min(1).optional(),
      role: z.string().min(1),
      location: z.string().min(1),
      availability: z.string().min(1),
      intro: z.string().min(1),
      mission: z.string().min(1),
      email: z.string().email(),
      brandMark: z.string().min(1).max(4).default("PF"),
      socialLinks: z.array(linkSchema).min(1),
    }),
    seo: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      siteUrl: siteUrlSchema.optional(),
    }),
    theme: z.object({
      fonts: z.object({
        body: z.string().min(1),
        display: z.string().min(1),
      }),
      palette: z.object({
        background: hexColorSchema,
        backgroundStrong: hexColorSchema,
        surface: hexColorSchema,
        surfaceStrong: hexColorSchema,
        text: hexColorSchema,
        textMuted: hexColorSchema,
        border: rgbaColorSchema,
        borderStrong: rgbaColorSchema,
        accent: hexColorSchema,
        inverse: hexColorSchema,
      }),
      themeColor: hexColorSchema.optional(),
    }),
    ui: uiSchema,
    sections: z.array(siteSectionSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const seenIds = new Set<string>();
    const seenProjectSlugs = new Set<string>();
    const enabledRoutes = new Set(
      value.sections
        .filter((section) => section.id === "home" || "enabled" in section)
        .filter((section) => section.id === "home" || section.enabled)
        .map((section) => sectionRegistry[section.id].route),
    );

    for (const [index, section] of value.sections.entries()) {
      if (seenIds.has(section.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate section id "${section.id}"`,
          path: ["sections", index, "id"],
        });
      }

      seenIds.add(section.id);

      if (section.id === "home") {
        validateActionHref(
          section.hero.primaryCta.href,
          ctx,
          ["sections", index, "hero", "primaryCta", "href"],
          enabledRoutes,
        );
        validateActionHref(
          section.hero.secondaryCta.href,
          ctx,
          ["sections", index, "hero", "secondaryCta", "href"],
          enabledRoutes,
        );
      }

      if (section.id === "projects") {
        for (const [projectIndex, project] of section.projects.entries()) {
          if (seenProjectSlugs.has(project.slug)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Duplicate project slug "${project.slug}"`,
              path: ["sections", index, "projects", projectIndex, "slug"],
            });
          }

          seenProjectSlugs.add(project.slug);

          if (
            project.status === "featured" &&
            !project.links.some((link) => link.external)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Featured projects must include at least one external proof link.",
              path: ["sections", index, "projects", projectIndex, "links"],
            });
          }

          for (const [linkIndex, link] of project.links.entries()) {
            validateConfiguredLink(
              link,
              ctx,
              [
                "sections",
                index,
                "projects",
                projectIndex,
                "links",
                linkIndex,
                "href",
              ],
              enabledRoutes,
            );
          }
        }
      }
    }

    if (!seenIds.has("home")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The "home" section is required.',
        path: ["sections"],
      });
    }

    for (const [index, link] of value.person.socialLinks.entries()) {
      validateConfiguredLink(
        link,
        ctx,
        ["person", "socialLinks", index, "href"],
        enabledRoutes,
      );
    }
  });

const siteConfigPaths: Record<Locale, string> = {
  en: resolve(process.cwd(), "site.config.en.yml"),
  es: resolve(process.cwd(), "site.config.es.yml"),
};

function loadRawSiteConfig(locale: Locale) {
  const source = readFileSync(siteConfigPaths[locale], "utf8");
  const parsed = parse(source);

  if (!parsed || typeof parsed !== "object") {
    throw new Error(
      `site.config.${locale}.yml must contain a YAML object at the root.`,
    );
  }

  return parsed;
}

export type SiteData = z.infer<typeof siteSchema>;
export type SiteSection = z.infer<typeof siteSectionSchema>;
export type SectionId = keyof typeof sectionRegistry;
export type PageSectionId = Exclude<SectionId, "home">;
export type HomeSection = z.infer<typeof homeSectionSchema>;
export type ProjectsSection = z.infer<typeof projectsSectionSchema>;
export type ExperienceSection = z.infer<typeof experienceSectionSchema>;
export type InterestsSection = z.infer<typeof interestsSectionSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ExperienceEntry = z.infer<typeof experienceSchema>;
export type NavigationItem = {
  id: SectionId;
  href: string;
  label: string;
};
export type SiteContext = ReturnType<typeof buildSiteContext>;

const siteDataCache = new Map<Locale, SiteData>();
const siteContextCache = new Map<Locale, SiteContext>();

export function getSiteData(locale: Locale = defaultLocale) {
  const cachedSiteData = siteDataCache.get(locale);

  if (cachedSiteData) {
    return cachedSiteData;
  }

  const siteData = siteSchema.parse(loadRawSiteConfig(locale));
  siteDataCache.set(locale, siteData);

  return siteData;
}

function getSectionFromSite<TSectionId extends SectionId>(
  siteData: SiteData,
  sectionId: TSectionId,
): Extract<SiteSection, { id: TSectionId }> {
  const section = siteData.sections.find(
    (
      currentSection,
    ): currentSection is Extract<SiteSection, { id: TSectionId }> =>
      currentSection.id === sectionId,
  );

  if (!section) {
    throw new Error(
      `Missing required section configuration for "${sectionId}".`,
    );
  }

  return section;
}

export function getBaseSectionHref(sectionId: SectionId) {
  return sectionRegistry[sectionId].route;
}

export function getSectionHref(
  sectionId: SectionId,
  locale: Locale = defaultLocale,
) {
  return localizePath(getBaseSectionHref(sectionId), locale);
}

export function isEnabledPageSection(
  section: SiteSection,
): section is Extract<SiteSection, { id: PageSectionId }> {
  return section.id !== "home" && section.enabled;
}

export function isKnownPageSectionId(
  sectionId: string,
): sectionId is PageSectionId {
  return sectionId in sectionRegistry && sectionId !== "home";
}

export function getPageSection(
  siteData: SiteData,
  sectionId: "projects",
): ProjectsSection;
export function getPageSection(
  siteData: SiteData,
  sectionId: "experience",
): ExperienceSection;
export function getPageSection(
  siteData: SiteData,
  sectionId: "interests",
): InterestsSection;
export function getPageSection(
  siteData: SiteData,
  sectionId: PageSectionId,
): ProjectsSection | ExperienceSection | InterestsSection;
export function getPageSection(siteData: SiteData, sectionId: PageSectionId) {
  const section = getSectionFromSite(siteData, sectionId);

  if (!isEnabledPageSection(section)) {
    throw new Error(`Section "${sectionId}" is disabled in the locale config.`);
  }

  return section;
}

export function getEnabledSections(sections: SiteSection[]) {
  return sections.filter(
    (
      section,
    ): section is HomeSection | Extract<SiteSection, { id: PageSectionId }> =>
      section.id === "home" || isEnabledPageSection(section),
  );
}

export function getEnabledPageSections(sections: SiteSection[]) {
  return sections.filter(isEnabledPageSection);
}

export function buildNavigationItems(
  sections: SiteSection[],
  locale: Locale = defaultLocale,
): NavigationItem[] {
  return getEnabledSections(sections).map((section) => ({
    id: section.id,
    href: getLocalizedSectionHref(section.id, locale),
    label: section.navLabel,
  }));
}

export function buildOptionalHomeCards(
  sections: SiteSection[],
  locale: Locale = defaultLocale,
) {
  return getEnabledPageSections(sections).map((section) => ({
    id: section.id,
    href: getLocalizedSectionHref(section.id, locale),
    eyebrow: section.homeCard.eyebrow,
    title: section.homeCard.title,
    description: section.homeCard.description,
  }));
}

export function getAllProjectTags(sections: SiteSection[]) {
  return getEnabledPageSections(sections)
    .filter((section): section is ProjectsSection => section.id === "projects")
    .flatMap((section) => section.projects.flatMap((project) => project.tags))
    .filter((tag, index, tags) => tags.indexOf(tag) === index)
    .sort();
}

export function getThemeCssVariables(siteData: SiteData) {
  return {
    "--color-bg": siteData.theme.palette.background,
    "--color-bg-strong": siteData.theme.palette.backgroundStrong,
    "--color-surface": siteData.theme.palette.surface,
    "--color-surface-strong": siteData.theme.palette.surfaceStrong,
    "--color-text": siteData.theme.palette.text,
    "--color-text-muted": siteData.theme.palette.textMuted,
    "--color-border": siteData.theme.palette.border,
    "--color-border-strong": siteData.theme.palette.borderStrong,
    "--color-accent": siteData.theme.palette.accent,
    "--color-inverse": siteData.theme.palette.inverse,
    "--font-body": siteData.theme.fonts.body,
    "--font-display": siteData.theme.fonts.display,
  };
}

export function getThemeInlineStyle(siteData: SiteData) {
  return Object.entries(getThemeCssVariables(siteData))
    .map(([token, value]) => `${token}: ${value};`)
    .join(" ");
}

function buildSiteContext(locale: Locale) {
  const siteData = getSiteData(locale);
  const enabledSections = getEnabledSections(siteData.sections);
  const enabledPageSections = getEnabledPageSections(siteData.sections);

  return {
    locale,
    siteData,
    homeSection: getSectionFromSite(siteData, "home"),
    enabledSections,
    enabledPageSections,
    navigationItems: buildNavigationItems(siteData.sections, locale),
    optionalHomeCards: buildOptionalHomeCards(siteData.sections, locale),
    allProjectTags: getAllProjectTags(siteData.sections),
    fallbackPageLink: enabledPageSections[0]
      ? {
          href: getLocalizedSectionHref(enabledPageSections[0].id, locale),
          label: enabledPageSections[0].navLabel,
        }
      : null,
    themeCssVariables: getThemeCssVariables(siteData),
    themeInlineStyle: getThemeInlineStyle(siteData),
  };
}

export function getSiteContext(locale: Locale = defaultLocale) {
  const cachedSiteContext = siteContextCache.get(locale);

  if (cachedSiteContext) {
    return cachedSiteContext;
  }

  const siteContext = buildSiteContext(locale);
  siteContextCache.set(locale, siteContext);

  return siteContext;
}

export const siteData = getSiteData();
export const homeSection = getSiteContext().homeSection;
export const enabledSections = getSiteContext().enabledSections;
export const enabledPageSections = getSiteContext().enabledPageSections;
export const navigationItems = getSiteContext().navigationItems;
export const optionalHomeCards = getSiteContext().optionalHomeCards;

export const projectStatuses: Array<Project["status"]> = [
  "featured",
  "live",
  "exploration",
];

export const allProjectTags = getSiteContext().allProjectTags;
export const fallbackPageLink = getSiteContext().fallbackPageLink;
export const themeCssVariables = getSiteContext().themeCssVariables;
export const themeInlineStyle = getSiteContext().themeInlineStyle;
