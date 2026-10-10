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

The site runs on **Cloudflare Workers Static Assets** as the `mcpwarp-io` Worker (root `wrangler.jsonc`, assets from `./dist`, no Worker script). Pushing to `main` runs `.github/workflows/deploy.yml`: `npm ci`, `npm run build`, then `cloudflare/wrangler-action` runs `wrangler deploy`. Wrangler is not a project dependency; the action installs the pinned version.

`workers_dev` and `preview_urls` are `false`, so the Worker is not reachable on its `*.workers.dev` URL. Unmatched paths get `dist/404.html` with a 404 status (`not_found_handling: "404-page"`). `www.mcpwarp.io` is handled by a zone Single Redirect rule, not a route.

To deploy locally, build and run `npx wrangler@4.127.1 deploy` (plain `npx wrangler` picks the latest version, not the one CI pins). Astro empties `dist` on every build, so a stale file shouldn't get uploaded; `rm -rf dist` before building is just a safeguard.

### Cutover history (GitHub Pages → Cloudflare Workers) — completed 2026-10-08

Kept as a record. Before the cutover `mcpwarp.io` was served by GitHub Pages: four proxied apex A records pointed at GitHub, and `www` was a proxied CNAME to `mcpwarp.github.io`, so the `www` → apex 301 came from GitHub.

1. **Token and secrets.** Token `mcpwarp-site-deploy` with **Account · Workers Scripts: Edit** (account-scoped — Workers Scripts is not a per-zone permission), plus, scoped to zone `mcpwarp.io`, **Zone · DNS: Edit** and **Zone · Workers Routes: Edit**. Repo secrets `CLOUDFLARE_API_TOKEN` (that token) and `CLOUDFLARE_ACCOUNT_ID` = `4c4880f9e7afd2ae7bbba67c7e0f6600` are set. To re-create, make a token with the same scopes and overwrite `CLOUDFLARE_API_TOKEN`.
2. `main` was first migrated on its own, as a one-page Astro site with the same deploy pipeline as `astro-site` (`wrangler.jsonc`, workflow and package files identical), so the first CI run created Worker `mcpwarp-io` with no routes and `workers_dev` off ("No targets deployed"). Merging `astro-site` later only brings content. There is no preview URL by design, so the first public view of the Worker was the cutover in step 3.
3. Attach the apex: `routes` uncommented in `wrangler.jsonc` and pushed. That CI run (wrangler 4.127.1) **failed**: the Cloudflare API refused to override the existing records, even with `override_existing_dns_record: true`, and the deploy stopped with error 100117 "Hostname 'mcpwarp.io' already has externally managed DNS records (A, CNAME, etc). Delete them first or try a different hostname." Calling `PUT /accounts/{id}/workers/scripts/mcpwarp-io/domains/records` with that flag directly returns the same error, and the dashboard (Worker → **Domains** tab → **Add Domain**) shows it too, with no override prompt. What worked: delete the four apex A records, then immediately attach the domain via `PUT /accounts/{account_id}/workers/domains` with `{"hostname": "mcpwarp.io", "service": "mcpwarp-io", "zone_id": "<zone id>", "environment": "production"}`. Cloudflare then creates its own proxied apex record and the certificate; the apex was down for a few seconds. Re-running the failed CI job then succeeded ("Deployed mcpwarp-io triggers … mcpwarp.io (custom domain)").
4. `www`: the zone **Single Redirect** rule was created first — hostname equals `www.mcpwarp.io` → dynamic redirect to `concat("https://mcpwarp.io", http.request.uri.path)`, status 301, preserve query string. It fires on any proxied `www` record. Then the `www` CNAME to `mcpwarp.github.io` was overwritten via the API with a **proxied** placeholder `A` record `www → 192.0.2.0` (reserved originless address per RFC 5737 — Cloudflare intercepts the request before it reaches it). The dashboard can't change a record's type, so there it's delete and recreate. The redirect rule needs a dynamic-redirect permission the CI token deliberately lacks, so it's done with the account owner's own access. Custom Domains require an exact hostname match, so `www` can't be a second route on the same Worker — see https://developers.cloudflare.com/workers/configuration/routing/custom-domains/#redirect-between-www-and-root-domain.
5. Verified `https://mcpwarp.io` loads and `https://www.mcpwarp.io/x?y` 301s to `https://mcpwarp.io/x?y`.
6. GitHub Pages unpublished (**Settings → Pages**).

### Rollback

`public/CNAME` doesn't matter here — Pages builds from a workflow, which ignores the CNAME file. Order matters: the hostname conflict from step 3 applies in reverse, so the Worker's Custom Domain has to go before the A records come back.

1. Re-enable Pages with source **GitHub Actions** and re-enter custom domain `mcpwarp.io` in repo **Settings → Pages**.
2. Restore the Pages `.github/workflows/deploy.yml` with `git show f7d889b:.github/workflows/deploy.yml` and push. `f7d889b` is in `astro-site`'s history; it's reachable from `main` only after a regular (non-squash) merge. This also removes the wrangler step, so no later push re-attaches the custom domain.
3. Remove the `mcpwarp-io` Worker's Custom Domain (Worker → **Domains** tab), or via the API: `DELETE /accounts/{account_id}/workers/domains/{domain_id}`, with the id from `GET /accounts/{account_id}/workers/domains`.
4. Immediately re-add the four apex `A` records, proxied: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
5. The `www` redirect rule and placeholder record can stay as they are — the rule sends `www` to the apex wherever the apex is served.
