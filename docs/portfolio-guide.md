# Reusable Portfolio Guide

This guide explains how to use this repository as a reusable portfolio template for yourself or other people.

The design goal is simple:

- one shared codebase
- one main authoring file: `site.config.yml`
- no source-code edits required for normal content, theme, or section changes

## Who This Is For

Use this guide if you want to:

- personalize this portfolio for yourself
- help a friend create their own portfolio from the same repo
- understand which parts are safe to edit without touching `src/`

## How the System Works

The site is split into two layers:

- code in `src/`: layout, components, routing, and validation
- content in `site.config.yml`: profile information, section copy, theme, and enabled sections

At build time, the site validates `site.config.yml` with Zod. If the config is invalid, the build should fail instead of shipping a broken site.

## First-Time Setup

1. Clone or fork the repository.
2. Run `npm install`.
3. Copy `site.config.example.yml` to `site.config.yml` if you want to start from the example content.
4. Edit `site.config.yml`.
5. Start the local server with `npm run dev`.
6. Run `npm run check` when your edits are ready.

## The Only File Most People Need

For normal customization, edit only:

- `site.config.yml`

That file controls:

- your name, role, email, and social links
- the text shown on each page
- which sections are enabled
- the order of sections in navigation
- the color palette
- the font stacks

If a friend is using this repo, this should be their main editing surface.

## Config Overview

The top-level keys in `site.config.yml` are:

- `person`
- `seo`
- `theme`
- `sections`

### `person`

Shared personal identity details used across the site.

Fields:

- `name`: full name shown in header and home hero
- `role`: short role or title shown in header
- `location`: current location text
- `availability`: short status line used in home and footer
- `intro`: homepage intro paragraph
- `mission`: short framing statement about how you work
- `email`: main contact email
- `brandMark`: short initials shown in the header mark
- `socialLinks`: list of external or internal links

### `seo`

Metadata for browser titles, search engines, and social cards.

Fields:

- `title`: default site title
- `description`: default site description
- `siteUrl`: default canonical site URL for local and non-release builds

Important:

- In GitHub Actions release builds, `PUBLIC_SITE_URL` should still be set as a repository variable.
- This prevents production images from shipping placeholder canonical URLs.

### `theme`

Brand-level visual tokens.

Fields:

- `fonts.body`: body copy font stack
- `fonts.display`: heading font stack
- `palette.background`
- `palette.backgroundStrong`
- `palette.surface`
- `palette.surfaceStrong`
- `palette.text`
- `palette.textMuted`
- `palette.border`
- `palette.borderStrong`
- `palette.accent`
- `palette.inverse`
- `themeColor`: browser theme color

Use valid CSS values:

- hex colors like `#101010`
- `rgba(...)` for border fields
- standard CSS font stacks

### `sections`

This is the most important part of the config.

The `sections` array controls:

- which sections exist
- their order in navigation
- their route content
- the homepage cards for optional sections

Current supported section ids are:

- `home`
- `projects`
- `experience`
- `interests`

Rules:

- `home` is required
- the others are optional
- optional sections can use `enabled: false`
- section order in the array controls navigation order

## Supported Sections

### `home`

This is the only mandatory section.

It includes:

- hero copy
- primary and secondary CTAs
- summary stats
- working principles

Recommended:

- keep `hero.intro` concise
- keep `stats` short and scannable
- make sure CTA links point to routes that are actually enabled

### `projects`

Optional route at `/projects`.

It includes:

- page intro
- homepage card text
- filter/search section copy
- project list

Each project includes:

- `slug`
- `title`
- `summary`
- `status`
- `year`
- `tags`
- `highlights`
- `links`

Allowed statuses:

- `featured`
- `live`
- `exploration`

### `experience`

Optional route at `/experience`.

It includes:

- page intro
- homepage card text
- timeline heading copy
- accordion entries

Each entry includes:

- `company`
- `role`
- `period`
- `location`
- `summary`
- `achievements`

### `interests`

Optional route at `/interests`.

It includes:

- page intro
- homepage card text
- skill groups
- interests
- current focus items

## Common Editing Tasks

### Change your name and header

Update:

- `person.name`
- `person.role`
- `person.brandMark`
- `sections[home].hero.headline`

### Disable a section

Example:

```yml
- id: interests
  enabled: false
```

Effect:

- the section disappears from navigation
- its route is not built
- its homepage card disappears

If you disable a section, also review:

- home CTA links
- project links that may point to a disabled route

### Reorder navigation

Move sections inside the `sections` array.

Example:

```yml
sections:
  - id: home
    ...
  - id: experience
    ...
  - id: projects
    ...
```

This changes:

- navigation order
- homepage optional section card order

### Create a home-only portfolio

A minimal portfolio is valid.

You can keep only:

- `home`

and remove the optional sections from the `sections` array entirely.

If you do that, update the home CTAs so they do not point to removed routes.

### Change fonts

Example:

```yml
theme:
  fonts:
    body: 'Georgia, "Times New Roman", serif'
    display: '"Avenir Next", "Segoe UI", sans-serif'
```

### Change colors

Example:

```yml
theme:
  palette:
    background: "#f9f6ef"
    backgroundStrong: "#fffdf7"
    surface: "#efe6d7"
    surfaceStrong: "#e4d5bc"
    text: "#1a1814"
    textMuted: "#5a5142"
    border: "rgba(26, 24, 20, 0.16)"
    borderStrong: "rgba(26, 24, 20, 0.4)"
    accent: "#965b2f"
    inverse: "#fffaf1"
```

## Workflow for Friends Reusing the Repo

If someone else wants their own portfolio:

1. Fork or copy the repository.
2. Duplicate `site.config.example.yml` into `site.config.yml`.
3. Replace all example content with their own profile.
4. Choose which optional sections to keep.
5. Set their own colors and fonts.
6. Run `npm run dev`.
7. Run `npm run check`.
8. Deploy using the same Docker or GitHub Actions workflow.

Recommended practice:

- keep code changes separate from content changes
- treat `site.config.yml` as the main authored artifact
- only edit `src/` when adding a new section type or changing behavior

## When You Need to Edit Code

Most people should not touch `src/`.

You only need code changes if you want to:

- add a brand-new section type beyond `home`, `projects`, `experience`, and `interests`
- change component behavior
- change layout structure beyond theme tokens and content
- add new deployment behavior

If you add a new section type, you will need to update:

- `src/data/site.ts`
- routing and rendering for the new section
- tests

## Validation and Testing

Useful commands:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
npm run check
```

Use `npm run check` before merging or deploying.

## Deployment Notes

### Local and Preview Builds

- `seo.siteUrl` is used as the default site URL when `PUBLIC_SITE_URL` is not set.

### Publish the Repository to GitHub

If this local repository is not on GitHub yet, create a new public repository and push `main`.

Using GitHub CLI:

```bash
gh repo create gerardovitale/portfolio --public --source=. --remote=origin --push
```

Using an existing empty repository:

```bash
git remote add origin git@github.com:gerardovitale/portfolio.git
git push -u origin main
```

### GitHub Actions Release Builds

- configure `PUBLIC_SITE_URL` as a repository variable
- this should be the real production origin, here `https://gerardo-vitale.com`
- create Docker Hub secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` in GitHub
- optional repository variable `DOCKERHUB_IMAGE` can override the target repository
- if `DOCKERHUB_IMAGE` is not set, the release workflow publishes to the Docker Hub repository matching `github.repository`
- make sure that Docker Hub repository is public so the Pi can pull it without extra auth

This matters because canonical URLs and sitemap entries use that value.

### Raspberry Pi Watchtower Deployment

The repository is wired for this release path:

1. push or merge to `main`
2. `CI` validates the site
3. the same workflow publishes `latest` and SHA-tagged images to Docker Hub after the quality job passes
4. `watchtower` on the Pi polls Docker Hub and replaces the running container when `latest` changes
5. `cloudflared` exposes the local container through a Cloudflare Tunnel

Prepare the Raspberry Pi once:

1. install Docker and the Docker Compose plugin
2. create `/opt/portfolio`
3. copy `deploy/docker-compose.pi.yml` to `/opt/portfolio/docker-compose.pi.yml`
4. copy `deploy/.env.pi.example` to `/opt/portfolio/.env`
5. edit `/opt/portfolio/.env` with the production values
6. create a Cloudflare named tunnel and a hostname for `gerardo-vitale.com`
7. point that hostname at the local service `http://portfolio:8081`
8. start the stack with `docker compose --env-file .env -f docker-compose.pi.yml up -d`

The Pi runtime env file should contain:

```bash
PORTFOLIO_IMAGE=gerardovitale/portfolio:latest
CLOUDFLARE_TUNNEL_TOKEN=replace-with-your-cloudflare-tunnel-token
WATCHTOWER_POLL_INTERVAL=300
```

The deploy stack now contains:

- `portfolio`: the Astro site container
- `watchtower`: polls Docker Hub every 5 minutes by default and updates only containers labeled for Watchtower
- `cloudflared`: keeps an outbound tunnel from the Pi to Cloudflare

This is continuous delivery through registry polling, not an immediate GitHub-orchestrated remote deploy. If you need near-instant rollouts, add a separate deploy step from GitHub Actions to the Pi over SSH or run a self-hosted runner on the Pi.

To force an update immediately instead of waiting for the next Watchtower poll, run:

```bash
docker compose --env-file .env -f docker-compose.pi.yml run --rm watchtower --run-once
```

If you need to roll back, change `PORTFOLIO_IMAGE` to a SHA-tagged image from Docker Hub in `/opt/portfolio/.env` and run:

```bash
docker compose --env-file .env -f docker-compose.pi.yml up -d
```

### Docker

To validate the production image path locally:

```bash
docker build --build-arg PUBLIC_SITE_URL=https://gerardo-vitale.com .
```

## Troubleshooting

### The build fails after editing the config

Likely causes:

- missing required fields
- wrong indentation in YAML
- invalid section ids
- invalid email or color formats

What to do:

1. check the error output from the failed command
2. compare your file to `site.config.example.yml`
3. run `npm run typecheck` or `npm run build` again after fixing the config

### A button points to a page that no longer exists

This usually happens after disabling a section.

Check:

- `home.hero.primaryCta.href`
- `home.hero.secondaryCta.href`
- any project links pointing to removed routes

### I changed the theme but it still looks wrong

Check:

- color values are valid CSS values
- font stacks are wrapped correctly in quotes when needed
- the dev server has reloaded after your edits

## Recommended Files to Share With Non-Technical Users

If you are handing this repo to a friend, point them to:

- `site.config.yml`
- `site.config.example.yml`
- `docs/content-config.md`
- `docs/portfolio-guide.md`

That is enough for most content and theme changes without needing to read the implementation.
