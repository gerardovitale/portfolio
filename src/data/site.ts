import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { parse } from "yaml";

const siteUrlSchema = z
  .string()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  external: z.boolean().default(false),
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
  interaction: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    searchPlaceholder: z.string().min(1),
  }),
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

const hexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
const rgbaColorSchema = z
  .string()
  .regex(/^rgba?\([^)]+\)$/)
  .or(hexColorSchema);

export const siteSchema = z
  .object({
    person: z.object({
      name: z.string().min(1),
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
    sections: z.array(siteSectionSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const seenIds = new Set<string>();

    for (const [index, section] of value.sections.entries()) {
      if (seenIds.has(section.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate section id "${section.id}"`,
          path: ["sections", index, "id"],
        });
      }

      seenIds.add(section.id);
    }

    if (!seenIds.has("home")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The "home" section is required.',
        path: ["sections"],
      });
    }
  });

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

const siteConfigPath = resolve(process.cwd(), "site.config.yml");

function loadRawSiteConfig() {
  const source = readFileSync(siteConfigPath, "utf8");
  const parsed = parse(source);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("site.config.yml must contain a YAML object at the root.");
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

export const siteData = siteSchema.parse(loadRawSiteConfig());

function getSectionFromSite<TSectionId extends SectionId>(
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

export function getSectionHref(sectionId: SectionId) {
  return sectionRegistry[sectionId].route;
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

export function getPageSection(sectionId: "projects"): ProjectsSection;
export function getPageSection(sectionId: "experience"): ExperienceSection;
export function getPageSection(sectionId: "interests"): InterestsSection;
export function getPageSection(
  sectionId: PageSectionId,
): ProjectsSection | ExperienceSection | InterestsSection;
export function getPageSection(sectionId: PageSectionId) {
  const section = getSectionFromSite(sectionId);

  if (!isEnabledPageSection(section)) {
    throw new Error(`Section "${sectionId}" is disabled in site.config.yml.`);
  }

  return section;
}

export const homeSection = getSectionFromSite("home");

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
): NavigationItem[] {
  return getEnabledSections(sections).map((section) => ({
    id: section.id,
    href: getSectionHref(section.id),
    label: section.navLabel,
  }));
}

export function buildOptionalHomeCards(sections: SiteSection[]) {
  return getEnabledPageSections(sections).map((section) => ({
    id: section.id,
    href: getSectionHref(section.id),
    eyebrow: section.homeCard.eyebrow,
    title: section.homeCard.title,
    description: section.homeCard.description,
  }));
}

export const enabledSections = getEnabledSections(siteData.sections);

export const enabledPageSections = getEnabledPageSections(siteData.sections);

export const navigationItems = buildNavigationItems(siteData.sections);

export const optionalHomeCards = buildOptionalHomeCards(siteData.sections);

export const projectStatuses: Array<Project["status"]> = [
  "featured",
  "live",
  "exploration",
];

export const allProjectTags = enabledPageSections
  .filter((section): section is ProjectsSection => section.id === "projects")
  .flatMap((section) => section.projects.flatMap((project) => project.tags))
  .filter((tag, index, tags) => tags.indexOf(tag) === index)
  .sort();

export const fallbackPageLink = enabledPageSections[0]
  ? {
      href: getSectionHref(enabledPageSections[0].id),
      label: enabledPageSections[0].navLabel,
    }
  : null;

export const themeCssVariables = {
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

export const themeInlineStyle = Object.entries(themeCssVariables)
  .map(([token, value]) => `${token}: ${value};`)
  .join(" ");
