# Protfolio

Static-first portfolio site built with Astro and React islands for CV, projects, and interests.

## Stack

- Astro with static output
- React islands for selective interactivity
- TypeScript with Zod-validated content
- Vitest and Playwright for quality gates
- Docker multi-stage build for Raspberry Pi friendly deployment

## Routes

- `/` home and profile summary
- `/projects` technical projects
- `/experience` CV and experience
- `/interests` stack and interests

## Development

```bash
npm install
npm run dev
```

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
