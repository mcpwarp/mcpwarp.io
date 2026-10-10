---
title: "Introducing MCP Warp: ngrok for MCP servers"
date: 2026-10-10
excerpt: MCP Warp is ngrok for MCP servers. It gives a server on your machine a public, OAuth-protected URL that works in claude.ai and ChatGPT.
description: MCP Warp is ngrok for MCP servers. It gives a server on your machine a public, OAuth-protected URL that works in claude.ai and ChatGPT.
authors: anatoly
draft: false
---

**MCP Warp gives the MCP servers on your machine a public HTTPS URL with OAuth in front of it, so claude.ai, ChatGPT and the Claude mobile apps can use them while the server keeps running locally.**

## The problem

You have an MCP server running on your laptop. Claude Desktop and Claude Code can use it, because they run on the same machine. claude.ai can't. When you add a custom connector, the request comes from Anthropic's servers, not your browser, and to them `localhost` is their own machine. ChatGPT works the same way, and so does a connector you use from the Claude app on your phone. [Why claude.ai can't connect to your local MCP server](/blog/claude-ai-localhost-mcp-server/) explains this in detail.

So the server needs a public HTTPS URL. And once a URL points at your machine, something has to decide who may call it, or anyone who finds the link can run your tools with your permissions.

## What MCP Warp does

You run `mcpwarp up` on your machine. It opens an outbound connection to the MCP Warp edge and registers the servers in your config. Each one gets its own public URL:

```
https://<name>-<username>.tunnel.mcpwarp.io/mcp
```

- **OAuth on every request.** There is no anonymous access. An unauthenticated request gets a `401` that MCP clients use to start the sign-in by themselves, and the edge only lets through tokens that belong to the server's owner. A valid token from another account gets a `403`. See [Security](/docs/concepts/security/).
- **stdio or HTTP.** If your server speaks Streamable HTTP on localhost, `mcpwarp` proxies to it. If it only speaks stdio, the kind you start with `uvx` or `npx`, `mcpwarp` spawns it and bridges it to HTTP.
- **One subdomain per server.** Clients such as VS Code and Claude Desktop cache OAuth credentials per origin, so two servers on one shared host could overwrite each other's tokens. Separate subdomains avoid that.
- **Streaming the whole way.** Long-running tool calls and large responses work as they do locally.
- **Nothing inbound.** The connection is outbound from your machine, so there is no port to open, no domain to buy and no certificate to manage.

[How MCP Warp works](/docs/concepts/how-mcp-warp-works/) traces a request end to end.

## Setting it up

The first run takes a few steps. After that it's `mcpwarp up`.

Install the CLI. With Homebrew on macOS or Linux:

```sh
brew tap mcpwarp/tap
brew trust --tap mcpwarp/tap
brew install --cask mcpwarp
```

Scoop and Linux packages are in [Get started](/docs/get-started/).

Sign in once at [web.mcpwarp.io](https://web.mcpwarp.io) to create your account and pick a username. The username goes into your URLs, and `mcpwarp up` fails with `USERNAME_REQUIRED` until you have one. Then log the CLI in to the same account:

```sh
mcpwarp login
```

Add your server to `~/.mcpwarp/config.json`. For a server already running on port 8765:

```json
{
  "servers": [
    { "name": "notes", "kind": "http", "url": "http://127.0.0.1:8765/mcp" }
  ]
}
```

For a stdio server, use `"kind": "stdio"` with `command` and `args` instead. [Expose a stdio server](/docs/how-to/expose-a-stdio-server/) has the full shape.

Start the tunnel:

```sh
mcpwarp up
```

```
NAME     KIND   URL
notes    http   https://notes-anatoly.tunnel.mcpwarp.io/mcp
```

Paste the URL into claude.ai or ChatGPT as a custom connector and complete the sign-in when it asks. A connector you add on claude.ai also shows up in the Claude mobile apps. The URL stays the same every time you run `mcpwarp up`, as long as the server name doesn't change, so you add the connector once.

`mcpwarp up` runs in the foreground. Stop it, or let the laptop sleep, and the URL returns `503` until it reconnects.

## Where it fits

ngrok and Cloudflare Tunnel will give you a public URL too, but OAuth and the stdio bridge are yours to set up, and Cloudflare Tunnel also needs a domain on Cloudflare. OpenAI's Secure MCP Tunnel is free and handles stdio, but it only serves OpenAI products such as ChatGPT and Codex. Anthropic's own MCP tunnels are for organizations on the Claude Enterprise plan, by request. MCP Warp is for the person in between: one named URL with OAuth already in front of it, usable from Claude and ChatGPT.

MCP Warp isn't certified by Anthropic or OpenAI; it's built to work with Claude and ChatGPT as a standard Streamable HTTP MCP client.

## Plans

Free is 100 requests a month and 1 server. Every HTTP request a client makes to your URL counts, and one chat with a few tool calls makes several, so Free is for trying it out. Plus is $5 a month with unlimited requests and 1 server. Pro is $10 a month with unlimited requests and servers. Details are on [Pricing](/pricing/) and in [Limits and quotas](/docs/reference/limits-and-quotas/).

## Next steps

- [Get started](/docs/get-started/) walks through the install and first tunnel.
- [One URL for your MCP server, in every client](/blog/remote-mcp-server-url/) shows how to add the URL to claude.ai, Claude Desktop, Claude Code, ChatGPT and VS Code.
- If Claude says "Couldn't reach the MCP server", work through [the checklist](/blog/couldnt-reach-the-mcp-server/).
