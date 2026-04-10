# Portfolio

Static-first portfolio site built with Astro and React islands, driven by a single YAML config file so one codebase can be reused by different people.

## Quick Start

1. Install dependencies with `npm install`.
2. Copy [site.config.example.yml](/Users/gerardovitale/Documents/repos/protfolio/site.config.example.yml) to `site.config.yml`.
3. Replace the example content in `site.config.yml` with your own profile, sections, and theme.
4. Run `npm run dev` and check the site locally.
5. Run `npm run check` before opening a PR or deploying.

## Stack

- Astro with static output
- React islands for selective interactivity
- TypeScript with Zod-validated content
- Vitest and Playwright for quality gates
- Docker multi-stage build for Raspberry Pi friendly deployment

## Documentation

- [docs/portfolio-guide.md](./docs/portfolio-guide.md): full setup, customization, and deployment guide
- [docs/content-config.md](./docs/content-config.md): config cheat sheet and common editing tasks

## Routes

- `/` home and profile summary
- optional section routes are generated from `site.config.yml`

## Development

```bash
npm install
npm run dev
```

The site reads all author-facing content from `site.config.yml`. In most cases you should not need to edit `src/` files to change text, colors, fonts, or section visibility.

## Quality Gates

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

Or run the full sequence with:

```bash
npm run check
```

## Git Hooks

Husky is configured through `npm install` via the `prepare` script.

- `pre-commit`: runs `npm run check:pre-commit`
- `pre-push`: runs `npm run check:pre-push`

If hooks stop working locally, run:

```bash
npm run prepare
```

## Production Preview

```bash
docker compose up --build
```

## Raspberry Pi Deployment

The repository includes:

- a multi-stage `Dockerfile`
- a Pi-oriented compose file at `deploy/docker-compose.pi.yml`
- a Caddy reverse proxy config at `deploy/Caddyfile`
- GitHub Actions for CI and release image publishing

The intended flow is:

1. Merge to `master`.
2. GitHub Actions publishes a versioned image to GHCR.
3. The Raspberry Pi pulls the tagged image and restarts the compose stack.

For release builds in GitHub Actions, `PUBLIC_SITE_URL` must be configured as a repository variable so canonical tags and sitemap entries use the production domain.
