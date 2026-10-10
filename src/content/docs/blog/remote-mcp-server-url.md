---
title: "One URL for your MCP server, in every client: claude.ai, Claude Desktop, Claude Code, ChatGPT and VS Code"
date: 2026-10-09
excerpt: Get one HTTPS URL for a local MCP server and add it to claude.ai, Claude Desktop, Claude Code, ChatGPT and VS Code. Steps for each client.
description: Get one HTTPS URL for a local MCP server and add it to claude.ai, Claude Desktop, Claude Code, ChatGPT and VS Code. Steps for each client.
authors: anatoly
draft: false
---

**A remote MCP server URL is a public HTTPS address, usually ending in `/mcp`, that speaks Streamable HTTP. Add it as a custom connector in claude.ai or ChatGPT, with `claude mcp add --transport http` in Claude Code, or as an `http` server in VS Code's `mcp.json`. The client then runs an OAuth sign-in.**

This page is the reference the other guides on this blog point to. It covers what the URL is, how to get one for a server on your own machine, and the exact steps for each client.

## What an MCP server URL is

An MCP server can talk to a client in two ways. Over stdio, the client launches the server as a child process and they exchange messages on stdin and stdout. Over Streamable HTTP, the server listens at an HTTP endpoint and any client that can reach it sends requests there. The endpoint path is usually `/mcp`, so a URL looks like this:

```
https://notes-anatoly.tunnel.mcpwarp.io/mcp
```

The URL is what you paste into a client. If the client runs on your machine (Claude Code, VS Code), `http://localhost:8765/mcp` can work. If the client runs in someone else's data centre (claude.ai, ChatGPT), the request comes from their servers, which can't reach your laptop, so the URL has to be public HTTPS. [Why claude.ai can't connect to your local MCP server](/blog/claude-ai-localhost-mcp-server/) explains that in detail, and [What is MCP](/docs/concepts/what-is-mcp/) covers the protocol itself.

A lot of people still wire remote servers into Claude Desktop through JSON config and [mcp-remote](https://github.com/geelen/mcp-remote), which had about 5.0 million npm downloads between 9 September and 8 October 2026 ([npm API](https://api.npmjs.org/downloads/point/last-month/mcp-remote)). mcp-remote goes the other direction from a tunnel: it lets a stdio-only client reach a server that already has a URL. Every client below can take the URL directly.

## Get a URL for a server on your machine

The rest of this page works with any public Streamable HTTP URL: your own reverse proxy, Cloudflare Tunnel with Access, ngrok with an auth layer, or [mcptunnels](https://github.com/terragohan/mcptunnels) (free, but the URL expires after 24 hours). The examples use MCP Warp, the tunnel we build.

The first run, once:

1. Install the CLI (Homebrew shown; Scoop and Linux packages are in [Get started](/docs/get-started/)):

   ```sh
   brew tap mcpwarp/tap
   brew trust --tap mcpwarp/tap
   brew install --cask mcpwarp
   ```

2. Sign in at [web.mcpwarp.io](https://web.mcpwarp.io) to create your account and choose a username.

3. Add the server to `~/.mcpwarp/config.json`. An HTTP server you already run:

   ```json
   {
     "servers": [
       { "name": "notes", "kind": "http", "url": "http://127.0.0.1:8765/mcp" }
     ]
   }
   ```

   Or a stdio server that `mcpwarp` should spawn itself:

   ```json
   {
     "servers": [
       {
         "name": "blender",
         "kind": "stdio",
         "command": "uvx",
         "args": ["blender-mcp"],
         "env": { "BLENDER_PATH": "/Applications/Blender.app" }
       }
     ]
   }
   ```

4. Check the config, log in and start the tunnel:

   ```sh
   mcpwarp status
   mcpwarp login
   mcpwarp up
   ```

   ```
   NAME     KIND   URL
   notes    http   https://notes-anatoly.tunnel.mcpwarp.io/mcp
   ```

After that, every session is `mcpwarp login` (when your session expires) and `mcpwarp up`. In the full-screen view, `c` copies the selected row's URL.

Each server gets its own subdomain, `<name>-<username>.tunnel.mcpwarp.io`, instead of a path under one shared host. Clients such as VS Code and Claude Desktop cache OAuth credentials per origin, so two servers on one host could clobber each other's tokens. [Why one subdomain per server](/docs/concepts/why-one-subdomain-per-server/) has the detail.

Two things to keep in mind. `mcpwarp up` has to be running on your machine, or the URL returns `503`. And the Free plan covers 100 requests a month and 1 server; every HTTP request a client makes counts. See [Limits and quotas](/docs/reference/limits-and-quotas/).

## Add it to each client

### claude.ai and Claude Desktop

Both use custom connectors, and Anthropic documents the same steps for each.

1. In claude.ai, go to [Customize > Connectors](https://claude.ai/customize/connectors) (Pro/Max), click "+ Add", then "Add custom connector". The steps are in Anthropic's help article on [custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).
2. Give it a name and paste the URL.
3. Click Connect and complete the OAuth sign-in when prompted.

Custom connectors are available "for users on Free, Pro, Max, Team, and Enterprise plans", and "Free users are limited to one custom connector" ([Anthropic help](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)).

The connector also reaches your phone. Per Anthropic, "Once you connect to a service on Claude or Claude Desktop, it will be available to use the next time you log in to your account on Claude for iOS or Android" ([Use connectors to extend Claude's capabilities](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)). Installing connectors on mobile itself is still in beta, so add it on the web or desktop first.

Anthropic also runs its own [MCP tunnels](https://claude.com/docs/connectors/mcp-tunnels/overview), but they are for organizations on the Enterprise plan, by request.

MCP Warp steps for Claude are in [Connect Claude](/docs/how-to/connect-claude/). MCP Warp isn't certified by Anthropic; it's built to work with Claude as a standard Streamable HTTP MCP client.

### Claude Code

Claude Code runs on your machine and adds servers from the command line:

```sh
claude mcp add --transport http notes https://notes-anatoly.tunnel.mcpwarp.io/mcp
```

Then authenticate: run `/mcp` inside a Claude Code session and pick the server, or run `claude mcp login notes` from your shell. The general form is `claude mcp add --transport http <name> <url>`; the [Claude Code MCP docs](https://code.claude.com/docs/en/mcp) list the other options.

If Claude Code is your only client, you can point it at `http://localhost:8765/mcp` and skip the tunnel. The case for a public URL is that the same address then works in claude.ai, on your phone and in ChatGPT.

### ChatGPT

Add a custom connector in ChatGPT's settings and paste the URL, then complete the OAuth sign-in. Menu names move around as ChatGPT changes; look for "connectors", "custom connectors", "apps" or "MCP servers" in settings. [Connect ChatGPT](/docs/how-to/connect-chatgpt/) has the MCP Warp side.

Check your plan before you start. Custom connectors on ChatGPT Plus and Pro are reported to be limited to read and fetch actions, with full MCP (write actions) on Business, Enterprise and Edu. We couldn't load [OpenAI's help article on developer mode](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt) to confirm this, so read it for your plan.

If ChatGPT is your only client, OpenAI's Secure MCP Tunnel may be the simpler route. Its open-source client, [openai/tunnel-client](https://github.com/openai/tunnel-client), connects "private or localhost MCP servers to ChatGPT, Codex, the Responses API, and AgentKit" and can spawn stdio servers. It doesn't serve claude.ai or other clients. OpenAI's [announcement](https://developers.openai.com/blog/connect-private-mcp-servers-to-openai-products) has the setup.

MCP Warp isn't certified by OpenAI; it's built to work with ChatGPT as a standard Streamable HTTP MCP client.
### VS Code

Add the server to `.vscode/mcp.json` with `"type": "http"`:

```json
{
  "servers": {
    "notes": {
      "type": "http",
      "url": "https://notes-anatoly.tunnel.mcpwarp.io/mcp"
    }
  }
}
```

VS Code runs the OAuth sign-in when it first connects. Like Claude Code, it runs locally, so a localhost URL also works if you don't need the server anywhere else. [Connect other clients](/docs/how-to/connect-other-clients/) has the same snippet.

### Anything else

Any client that speaks Streamable HTTP can use the URL: add a remote server pointing at it and complete the OAuth sign-in when the client asks. The legacy 2024-11-05 HTTP+SSE transport (a `GET /sse` endpoint plus `POST /messages`) is not supported by MCP Warp, so a client that only knows SSE won't connect.

## Comparison table

As of 9 October 2026. Cells marked "unverified" are ones we haven't confirmed against the vendor's documentation.

| Client | Where to add it | Runs OAuth | Accepts localhost | Plan requirements |
| --- | --- | --- | --- | --- |
| claude.ai | Customize > Connectors > Add custom connector | Yes | No | Free (1 custom connector), Pro, Max, Team, Enterprise |
| Claude Desktop | Connectors settings, same steps as claude.ai | Yes | No, for custom connectors | Same as claude.ai |
| Claude mobile apps | Add on web or desktop; it syncs | Uses the web grant (unverified) | No | Same as claude.ai |
| Claude Code | `claude mcp add --transport http` | Yes, via `/mcp` or `claude mcp login` | Yes | Unverified |
| ChatGPT | Settings, connectors or apps | Yes | No | Plus/Pro reported read-only (unverified) |
| VS Code | `.vscode/mcp.json`, `"type": "http"` | Yes | Yes | Unverified |

The URL is tied to your MCP Warp account. Every request needs an OAuth token that belongs to the server's owner, so other people can't use your server through it even if they have the link. See [Security](/docs/concepts/security/).

## When it doesn't connect

Start with the status code at the URL. With MCP Warp, `503` means `mcpwarp up` isn't connected, `404` means a wrong URL or a server disabled in the dashboard, and `429` means the month's quota is used up. [Troubleshooting](/docs/how-to/troubleshooting/) lists every message.

If claude.ai says "Couldn't reach the MCP server", work through [the checklist for that error](/blog/couldnt-reach-the-mcp-server/). It applies to any server and any tunnel.

## More guides

- [Why claude.ai can't connect to your local MCP server (and how to fix it)](/blog/claude-ai-localhost-mcp-server/)
- ["Couldn't reach the MCP server" in Claude: a checklist](/blog/couldnt-reach-the-mcp-server/)