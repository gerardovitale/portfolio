# Portfolio Content Config

Edit `site.config.yml` to change portfolio content, enabled sections, ordering, and theme.

For the full end-to-end setup and reuse guide, see [docs/portfolio-guide.md](./portfolio-guide.md).

## Quick Reference

- `person`: shared profile details used across the header, homepage, and footer
- `seo`: browser title, meta description, and default canonical site URL
- `theme`: font stacks and color palette tokens
- `sections`: the section list, in navigation order

## Rules

- `home` is required.
- `projects`, `experience`, and `interests` are optional.
- `enabled: false` removes an optional section from navigation, homepage cards, and built routes.
- Reordering items inside `sections` reorders navigation and homepage cards.

## Common Tasks

Disable a section:

```yml
- id: interests
  enabled: false
```

Create a home-only portfolio:

```yml
sections:
  - id: home
    ...
```

Change navigation order:

```yml
sections:
  - id: home
    ...
  - id: experience
    ...
  - id: projects
    ...
```

Change fonts and accent color:

```yml
theme:
  fonts:
    body: 'Georgia, "Times New Roman", serif'
    display: '"Avenir Next", "Segoe UI", sans-serif'
  palette:
    accent: "#965b2f"
```

## Validation

The site validates `site.config.yml` during tests and builds. If the config shape is invalid, commands like `npm run typecheck`, `npm run build`, or `npm run check` should fail fast.
