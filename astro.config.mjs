// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import starlightImageZoom from 'starlight-image-zoom';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mcpwarp.io',
  integrations: [
    starlight({
      title: 'MCP Warp',
      logo: {
        src: './src/assets/favicon.svg',
        alt: 'MCP Warp',
      },
      favicon: '/favicon.svg',
      description:
        'Give your local MCP servers a public, OAuth-protected URL. Like ngrok, but built for MCP.',
      customCss: ['./src/styles/global.css'],
      defaultLocale: 'en',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/mcpwarp' }],
      components: {
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        MarkdownContent: './src/components/MarkdownContent.astro',
      },
      plugins: [
        starlightImageZoom(),
        starlightBlog({
          prefix: 'blog',
          title: 'Blog',
          // We hand-write the Blog nav link in Header.astro; without this,
          // starlight-blog's own ThemeSelect override injects a second one.
          navigation: 'none',
          authors: {
            anatoly: {
              name: 'Anatoly',
              url: 'https://anatoly.dev',
            },
          },
          rss: true,
        }),
      ],
      sidebar: [
        {
          label: 'Get started',
          items: [
            { label: 'Overview', link: '/docs/' },
            { label: 'Get started', link: '/docs/get-started/' },
          ],
        },
        {
          label: 'How-to',
          items: [
            { label: 'Expose a stdio server', link: '/docs/how-to/expose-a-stdio-server/' },
            { label: 'Expose an HTTP server', link: '/docs/how-to/expose-an-http-server/' },
            { label: 'Connect Claude', link: '/docs/how-to/connect-claude/' },
            { label: 'Connect ChatGPT', link: '/docs/how-to/connect-chatgpt/' },
            { label: 'Connect other clients', link: '/docs/how-to/connect-other-clients/' },
            { label: 'Troubleshooting', link: '/docs/how-to/troubleshooting/' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'What is MCP', link: '/docs/concepts/what-is-mcp/' },
            { label: 'How MCP Warp works', link: '/docs/concepts/how-mcp-warp-works/' },
            { label: 'Security', link: '/docs/concepts/security/' },
            {
              label: 'Why one subdomain per server',
              link: '/docs/concepts/why-one-subdomain-per-server/',
            },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI', link: '/docs/reference/cli/' },
            { label: 'Config', link: '/docs/reference/config/' },
            { label: 'Environment variables', link: '/docs/reference/environment-variables/' },
            { label: 'Limits and quotas', link: '/docs/reference/limits-and-quotas/' },
          ],
        },
        { label: 'Get help', link: '/docs/get-help/' },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
