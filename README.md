# mcpwarp.io

Marketing site and docs for MCP Warp. Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build), styled with Tailwind CSS v4.

## Stack

- **Astro 7** — site framework.
- **Starlight** — docs framework (search, sidebar, dark/light theme, i18n scaffolding).
- **starlight-blog** — the blog at `/blog/`.
- **starlight-image-zoom** — click-to-zoom on doc images.
- **Tailwind CSS v4** (`@tailwindcss/vite`) + **@astrojs/starlight-tailwind** — styling, wired into Starlight's own CSS variables.

## Running it

```sh
npm install
npm run dev       # dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run check     # astro check (types + diagnostics)
```

A [`justfile`](./justfile) wraps the same commands (`just dev`, `just build`, `just preview`, `just check`).

## Structure

- `src/pages/` — custom marketing pages (`index.astro`, `pricing.astro`, `about.astro`, `privacy.astro`, `terms.astro`), built on `src/layouts/Marketing.astro`.
- `src/content/docs/docs/` — documentation, served under `/docs/`.
- `src/content/docs/blog/` — blog posts, served under `/blog/`.
- `src/components/` — Starlight component overrides (`Header.astro`, `Footer.astro`, `ThemeProvider.astro`, `ThemeSelect.astro`, `MarkdownContent.astro`).
- `astro.config.mjs` — Starlight config, sidebar, plugins.

## Palette

All brand colors live in **`src/styles/theme.css`** — one `@theme` block with `--color-accent-*`, `--color-gray-*`, and a few semantic tokens (`--color-brand`, `--color-brand-glow`). To reskin the site, edit that file and nothing else — every page and component reads colors through these tokens or Tailwind utilities derived from them. The only other place a literal hex color is allowed is `public/favicon.svg`, which is a static asset.

## Deployment

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml` (`withastro/action` + `actions/deploy-pages`). The custom domain is set via `public/CNAME`.
