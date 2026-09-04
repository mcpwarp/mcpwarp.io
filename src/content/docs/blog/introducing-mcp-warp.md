---
title: Introducing MCP Warp
date: 2026-09-04
draft: true
excerpt: Ngrok for MCP servers — a public, OAuth-protected URL for the MCP servers running on your machine.
authors: anatoly
---

MCP Warp gives the MCP servers running on your machine a public, OAuth-protected URL — the kind of URL you can paste straight into Claude, ChatGPT, Cursor, or VS Code.

If you've used ngrok, the shape will feel familiar: you keep running your server locally, and MCP Warp handles the public endpoint. The difference is what sits in front of it. Every URL is OAuth-protected by default — there's no anonymous access, and no shared secret to leak. Each server gets its own subdomain, so OAuth credential caches in your clients never collide between servers.

```sh
npm install -g mcpwarp
mcpwarp login
mcpwarp up
```

```
NAME     KIND   URL
blender  stdio  https://7f3a1c2e.mcpwarp.io/mcp
```

That's it — the URL is what you paste into your MCP client.

Head to [Get started](/docs/get-started/) for the full walkthrough, or [Pricing](/pricing/) for plan details.
