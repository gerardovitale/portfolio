# Portfolio

Static-first portfolio site built with Astro and React islands, driven by locale-specific YAML config files so one codebase can publish both English and Spanish variants.

## Quick Start

1. Install dependencies with `npm install`.
2. Edit `site.config.en.yml` for the default English site content.
3. Edit `site.config.es.yml` for the Spanish localized content.
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
- optional English section routes are generated from `site.config.en.yml`
- Spanish localized routes are generated under `/es` from `site.config.es.yml`

## Development

```bash
npm install
npm run dev
```

The site reads author-facing content from `site.config.en.yml` and `site.config.es.yml`. In most cases you should not need to edit `src/` files to change copy, colors, fonts, or section visibility.

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

## Publish to GitHub

If the repository does not exist on GitHub yet, create it first and then push `main`.

With GitHub CLI:

```bash
gh repo create gerardovitale/portfolio --public --source=. --remote=origin --push
```

Or create the repository in the GitHub UI and then run:

```bash
git remote add origin git@github.com:gerardovitale/portfolio.git
git push -u origin main
```

## Raspberry Pi Deployment

The repository includes:

- a multi-stage `Dockerfile`
- a Pi-oriented compose file at `deploy/docker-compose.pi.yml`
- an optional direct-ingress Caddy config at `deploy/Caddyfile`
- a Pi runtime env template at `deploy/.env.pi.example`
- GitHub Actions for CI and release image publishing

The intended flow is:

1. Merge to `main`.
2. GitHub Actions runs the full quality gate.
3. If CI passes, the same workflow publishes versioned images to Docker Hub.
4. The Raspberry Pi runs `watchtower` and polls Docker Hub for a newer `latest` image.
5. `cloudflared` exposes the local service through a Cloudflare Tunnel, so the Pi does not need to be publicly reachable.

GitHub repository configuration:

- repository variable `PUBLIC_SITE_URL=https://gerardo-vitale.com`
- secret `DOCKERHUB_USERNAME`
- secret `DOCKERHUB_TOKEN`
- optional repository variable `DOCKERHUB_IMAGE`
- if `DOCKERHUB_IMAGE` is not set, the release workflow publishes to the Docker Hub repository matching `github.repository`
- create or confirm that Docker Hub repository and keep it public so the Pi can pull it without extra auth

Pi bootstrap:

1. Create a deployment directory, for example `/opt/portfolio`.
2. Copy `deploy/docker-compose.pi.yml` and `deploy/.env.pi.example` into that directory.
3. Rename `deploy/.env.pi.example` to `.env` and set the real values.
4. In Cloudflare Zero Trust, create a named tunnel and set a public hostname for `gerardo-vitale.com` targeting the internal service `http://portfolio:8081`.
5. Do not expose `:8081` in the public hostname, and do not point the tunnel at `http://gerardo-vitale.com:8081`.
6. Put the generated tunnel token into `.env` as `CLOUDFLARE_TUNNEL_TOKEN`.
7. Start the stack with `docker compose --env-file .env -f docker-compose.pi.yml up -d`.

Operational notes:

- Watchtower polls Docker Hub every 5 minutes by default via `WATCHTOWER_POLL_INTERVAL=300`.
- You can raise or lower that interval in the Pi `.env` file if you want a different tradeoff between rollout speed and registry polling frequency.
- This is continuous delivery through registry polling, not an immediate remote deploy from GitHub Actions.
- Watchtower only updates containers explicitly labeled for this stack, so it will not restart unrelated services on the Pi.
- After each deploy, verify the public hostname returns `200` for `/`, `/projects`, `/experience`, `/interests`, `/es`, and `/es/projects`, and confirm no `Location` header exposes `:8081`.
- If only one desktop browser is broken while mobile and other clients work, clear that browser's cached site data, redirect state, and DNS/HSTS state before changing the server.
- To force an immediate update without waiting for the next poll, run:

```bash
docker compose --env-file .env -f docker-compose.pi.yml run --rm watchtower --run-once
```

For release builds in GitHub Actions, `PUBLIC_SITE_URL` must be set to the production domain so canonical tags and sitemap entries use the live origin.
