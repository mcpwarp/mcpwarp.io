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

### Cutover (GitHub Pages → Cloudflare Workers)

Today `mcpwarp.io` is served by GitHub Pages: four proxied apex A records point at GitHub, and `www` is a proxied CNAME to `mcpwarp.github.io`, so the `www` → apex 301 comes from GitHub. That redirect has to be replaced on Cloudflare (step 4) before Pages is unpublished.

1. **Token and secrets — done 2026-10-08.** Token `mcpwarp-site-deploy` with **Account · Workers Scripts: Edit** (account-scoped — Workers Scripts is not a per-zone permission), plus, scoped to zone `mcpwarp.io`, **Zone · DNS: Edit** and **Zone · Workers Routes: Edit**. Repo secrets `CLOUDFLARE_API_TOKEN` (that token) and `CLOUDFLARE_ACCOUNT_ID` = `4c4880f9e7afd2ae7bbba67c7e0f6600` are set. To re-create, make a token with the same scopes and overwrite `CLOUDFLARE_API_TOKEN`.
2. Merge `astro-site` into `main`. The first CI run creates Worker `mcpwarp-io` with no routes and `workers_dev` off; wrangler logs "No targets deployed". There is no preview URL by design, so the first public view of the new site is the cutover in step 3. That's the accepted trade-off. Rollback before step 6: comment `routes` back out and push (otherwise the next CI run re-attaches the domain and overrides the A records again), remove the Custom Domain, re-add the four A records proxied. After step 6: see Rollback.
3. Attach the apex: uncomment `routes` in `wrangler.jsonc` and push. In CI (non-interactive) wrangler calls `PUT /accounts/{id}/workers/scripts/mcpwarp-io/domains/records` with `override_existing_dns_record: true`, which swaps the apex A records atomically (no manual record deletion, no NXDOMAIN window) and provisions the certificate. Alternatives: the dashboard (**Workers & Pages → mcpwarp-io → Settings → Domains & Routes**, or the newer **Domains** tab → **Add → Custom Domain** → **"Override existing DNS record"**), or calling that endpoint directly. Do not delete the apex records by hand first.
4. `www`: create the zone **Single Redirect** rule first — hostname equals `www.mcpwarp.io` → dynamic redirect to `concat("https://mcpwarp.io", http.request.uri.path)`, status 301, preserve query string. It already fires on the current proxied CNAME. Then replace the `www` CNAME to `mcpwarp.github.io` with a **proxied** placeholder `A` record `www → 192.0.2.0` (reserved originless address per RFC 5737 — Cloudflare intercepts the request before it reaches it). The dashboard can't change a record's type, so delete and recreate; via the API it's one overwrite. The redirect rule needs a dynamic-redirect permission the CI token deliberately lacks, so do it with the account owner's own access. Custom Domains require an exact hostname match, so `www` can't be a second route on the same Worker — see https://developers.cloudflare.com/workers/configuration/routing/custom-domains/#redirect-between-www-and-root-domain.
5. Verify `https://mcpwarp.io` loads and `https://www.mcpwarp.io/x?y` 301s to `https://mcpwarp.io/x?y`.
6. Unpublish GitHub Pages (**Settings → Pages**) and optionally delete the `github-pages` environment.

### Rollback

`public/CNAME` doesn't matter here — Pages builds from a workflow, which ignores the CNAME file.

- Re-enable Pages with source **GitHub Actions** and re-enter custom domain `mcpwarp.io` in repo **Settings → Pages**.
- Restore the pre-migration `.github/workflows/deploy.yml` from git history (`git show f7d889b:.github/workflows/deploy.yml`). This also removes the wrangler step — otherwise the next push re-attaches the custom domain and overwrites the restored A records.
- Remove the `mcpwarp-io` Worker's Custom Domain (Workers & Pages → mcpwarp-io → Settings → Domains & Routes), or via the API: `DELETE /accounts/{account_id}/workers/domains/{domain_id}`, with the id from `GET /accounts/{account_id}/workers/domains`.
- Re-add the four apex `A` records, proxied: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- The `www` redirect rule and placeholder record can stay as they are — the rule sends `www` to the apex wherever the apex is served.
