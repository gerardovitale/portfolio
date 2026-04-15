# Repository Guidelines

## Project Structure & Module Organization

- `src/pages/`: Astro routes for the site, including `/`, `/projects`, `/experience`, `/interests`, and `404.astro`.
- `src/components/`: shared Astro and React UI pieces such as `Header.astro` and interactive islands.
- `src/data/`: typed portfolio content and schema-backed data sources.
- `src/lib/`: small helpers for routing and metadata.
- `src/styles/`: global design tokens and shared CSS.
- `tests/`: Playwright end-to-end and accessibility coverage.
- `infra/` and `deploy/`: nginx config, Raspberry Pi compose stack, and reverse-proxy setup.
- `.github/workflows/`: CI and release automation.

## Build, Test, and Development Commands

- `npm run dev`: start the Astro dev server.
- `npm run build`: produce the static production build in `dist/`.
- `npm run preview`: serve the built site locally.
- `npm run lint`: run ESLint across Astro, TypeScript, and config files.
- `npm run format:check`: verify Prettier formatting.
- `npm run typecheck`: run `astro check`.
- `npm run test:unit`: run Vitest unit tests.
- `npm run test:e2e`: run Playwright browser and accessibility tests.
- `npm run check:pre-commit`: run the local commit gate.
- `npm run check:pre-push`: run the full push gate.
- `npm run check`: run the full validation sequence locally in CI order.
- `docker build --build-arg PUBLIC_SITE_URL=https://example.com .`: verify the production image path.

## Coding Style & Naming Conventions

- Use TypeScript and Astro with 2-space indentation and Prettier defaults.
- Keep components in PascalCase, helpers in camelCase, and route files aligned to URL paths.
- Prefer small typed helpers in `src/lib/` over inline route logic.
- Keep client-side React limited to interactive islands; default to static Astro markup elsewhere.

## Testing Guidelines

- Unit tests use Vitest and live beside source files as `*.test.ts` or `*.test.tsx`.
- Browser and accessibility tests use Playwright in `tests/`.
- Add or update tests for any behavior change in routing, metadata, or interactive UI.
- Before opening a PR, run `npm run check`.

## Commit & Pull Request Guidelines

- Use trunk-based development: branch from `main`, keep branches short-lived, and merge small, releasable changes back quickly.
- Use short imperative commit messages, for example: `Fix active nav path normalization`.
- Keep commits focused; separate content edits from tooling or infra changes when practical.
- Local hooks are enforced with Husky. `pre-commit` runs the fast gate; `pre-push` runs `npm run check`.
- PRs should include:
- a short summary of user-facing and technical changes
- linked issue or task reference if one exists
- screenshots or a short recording for UI changes
- confirmation that lint, typecheck, unit, and e2e checks passed

## Security & Configuration Tips

- Set `PUBLIC_SITE_URL` for production and release builds; the Docker and GitHub Actions paths depend on it.
- Do not commit real secrets to `.env`; use `.env.example` as the template.
