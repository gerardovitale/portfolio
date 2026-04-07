import { z } from "zod";

const statSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  detail: z.string().min(1),
});

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  external: z.boolean().default(false),
});

const projectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(["featured", "live", "exploration"]),
  year: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)).min(2),
  links: z.array(linkSchema).min(1),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  location: z.string().min(1),
  summary: z.string().min(1),
  achievements: z.array(z.string().min(1)).min(2),
});

const skillGroupSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(z.string().min(1)).min(2),
});

const interestSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
});

const principleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const siteSchema = z.object({
  person: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    location: z.string().min(1),
    availability: z.string().min(1),
    intro: z.string().min(1),
    mission: z.string().min(1),
    email: z.string().email(),
    socialLinks: z.array(linkSchema).min(2),
  }),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  stats: z.array(statSchema).length(3),
  principles: z.array(principleSchema).length(3),
  projects: z.array(projectSchema).min(3),
  experience: z.array(experienceSchema).min(3),
  skillGroups: z.array(skillGroupSchema).min(3),
  interests: z.array(interestSchema).min(3),
  now: z.array(z.string().min(1)).min(2),
});

const rawSiteData = {
  person: {
    name: "Gerardo Vitale",
    role: "Data Engineer and Product-Minded Builder",
    location: "Madrid, Spain",
    availability: "Open to senior data engineering and platform roles.",
    intro:
      "I design data products and developer tooling that stay understandable under pressure. The focus is durable systems, clear interfaces, and delivery practices that survive real operations.",
    mission:
      "This portfolio is structured like the way I work: editorially clear, technically grounded, and interactive only where interaction sharpens the story.",
    email: "hello@example.com",
    socialLinks: [
      {
        label: "GitHub",
        href: "https://github.com/gerardovitale",
        external: true,
      },
      { label: "LinkedIn", href: "https://www.linkedin.com", external: true },
      { label: "Email", href: "mailto:hello@example.com", external: false },
    ],
  },
  seo: {
    title: "Gerardo Vitale | Data Engineer",
    description:
      "Portfolio for a data engineer focused on resilient pipelines, practical platform design, and clear product delivery.",
  },
  stats: [
    {
      label: "Focus",
      value: "Platform + Analytics",
      detail: "From ingestion to trusted product surfaces.",
    },
    {
      label: "Delivery",
      value: "CI-First",
      detail: "Every iteration is built to be tested, reviewed, and shipped.",
    },
    {
      label: "Bias",
      value: "Operational Clarity",
      detail:
        "Observability, ownership, and maintainability are non-negotiable.",
    },
  ],
  principles: [
    {
      title: "Build systems people can reason about",
      body: "I prefer explicit data contracts, clear ownership lines, and release paths that do not require heroics at 2 a.m.",
    },
    {
      title: "Keep the user-facing layer responsive",
      body: "Static-first delivery and selective client interactivity are enough for most portfolio and content experiences, especially on constrained hardware.",
    },
    {
      title: "Treat quality as a delivery feature",
      body: "Type checks, tests, accessibility validation, and release automation are part of the product, not afterthoughts.",
    },
  ],
  projects: [
    {
      slug: "zen-portfolio",
      title: "Zen Python Portfolio",
      summary:
        "A monochrome editorial portfolio system translated from Stitch concepts into a production-grade static application.",
      status: "featured",
      year: "2026",
      tags: ["Astro", "TypeScript", "Design Systems", "CI/CD"],
      highlights: [
        "Converted exploratory screens into a maintainable route structure with typed content.",
        "Designed for Raspberry Pi deployment with static output and containerized delivery.",
      ],
      links: [
        {
          label: "View implementation plan",
          href: "/projects",
          external: false,
        },
      ],
    },
    {
      slug: "trip-optimizer",
      title: "Trip Planner and Optimizer",
      summary:
        "A route and price intelligence concept focused on clear comparative analysis, layered data, and operational trust.",
      status: "live",
      year: "2026",
      tags: ["Data Products", "Maps", "UX", "Optimization"],
      highlights: [
        "Balanced dense information design with strong content hierarchy.",
        "Defined a path from prototype exploration into measurable product increments.",
      ],
      links: [
        { label: "Case study route", href: "/projects", external: false },
      ],
    },
    {
      slug: "pipeline-observatory",
      title: "Pipeline Observatory",
      summary:
        "An internal-facing operations surface for tracking pipeline health, failed jobs, and release readiness.",
      status: "exploration",
      year: "2025",
      tags: ["Observability", "Data Engineering", "Operations"],
      highlights: [
        "Centered alert triage around actionability instead of dashboard sprawl.",
        "Used structured metadata to make failure states obvious to owners and reviewers.",
      ],
      links: [
        { label: "Experience context", href: "/experience", external: false },
      ],
    },
  ],
  experience: [
    {
      company: "Platform and Analytics Team",
      role: "Senior Data Engineer",
      period: "2023 - Present",
      location: "Madrid / Remote",
      summary:
        "Leading data platform improvements across ingestion, transformation, observability, and release safety.",
      achievements: [
        "Standardized quality gates for analytics delivery with repeatable testing and CI workflows.",
        "Reduced operational ambiguity by introducing clearer ownership and health signals across pipelines.",
        "Partnered with product teams to turn raw reporting requests into sustained data products.",
      ],
    },
    {
      company: "Product Data Studio",
      role: "Data Engineer",
      period: "2021 - 2023",
      location: "Remote",
      summary:
        "Built resilient ETL workflows and developer tooling that shortened iteration cycles for analytics teams.",
      achievements: [
        "Designed modular transformation layers that improved confidence in downstream reporting.",
        "Introduced code review and CI standards that made data changes easier to validate before release.",
      ],
    },
    {
      company: "Independent Projects",
      role: "Builder and Consultant",
      period: "2019 - 2021",
      location: "Spain",
      summary:
        "Worked across portfolio sites, business dashboards, and automation-heavy internal tools with a focus on simplicity.",
      achievements: [
        "Delivered static-first websites with clear deployment and rollback stories for small teams.",
        "Translated rough concepts into maintainable systems instead of one-off handoffs.",
      ],
    },
  ],
  skillGroups: [
    {
      title: "Data Platforms",
      description:
        "Systems that move, validate, and publish data with strong operational visibility.",
      items: [
        "Python",
        "SQL",
        "dbt",
        "Airflow",
        "Data Modeling",
        "Observability",
      ],
    },
    {
      title: "Product Engineering",
      description:
        "Interfaces and tooling that make technical systems easier to trust and use.",
      items: [
        "TypeScript",
        "React",
        "Astro",
        "Design Systems",
        "Testing",
        "Accessibility",
      ],
    },
    {
      title: "Delivery Practice",
      description:
        "The release discipline that turns good code into dependable software.",
      items: [
        "GitHub Actions",
        "Docker",
        "CI/CD",
        "Release Management",
        "Documentation",
        "Code Review",
      ],
    },
  ],
  interests: [
    {
      title: "Editorial interface systems",
      summary:
        "I am drawn to interfaces that use spacing, rhythm, and tone to create clarity without visual noise.",
    },
    {
      title: "Low-friction home deployments",
      summary:
        "Raspberry Pi and small-device hosting force useful product discipline: fast startup, low overhead, clear ops.",
    },
    {
      title: "Tooling for calm operations",
      summary:
        "The best internal tools reduce ambiguity and help teams make the next correct decision quickly.",
    },
  ],
  now: [
    "Building a production-ready portfolio from Stitch design explorations.",
    "Refining a data-engineering narrative that emphasizes product thinking, not only pipelines.",
    "Keeping the delivery path light enough to run comfortably on Raspberry Pi hardware.",
  ],
};

export const siteData = siteSchema.parse(rawSiteData);
export type SiteData = z.infer<typeof siteSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ExperienceEntry = z.infer<typeof experienceSchema>;

export const projectStatuses: Array<Project["status"]> = [
  "featured",
  "live",
  "exploration",
];

export const allProjectTags = Array.from(
  new Set(siteData.projects.flatMap((project) => project.tags)),
).sort();
