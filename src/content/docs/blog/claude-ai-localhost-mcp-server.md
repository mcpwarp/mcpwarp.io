---
title: Why claude.ai can't connect to your local MCP server (and how to fix it)
date: 2026-10-07
excerpt: claude.ai rejects localhost MCP URLs because Anthropic's servers make the call, not your browser. Why that happens and what a working fix needs.
description: claude.ai rejects localhost MCP URLs because Anthropic's servers make the call, not your browser. Why that happens and what a working fix needs.
authors: anatoly
draft: false
---

**claude.ai can't use a localhost MCP server because the connection comes from Anthropic's servers, and they can't reach your machine. The server needs a public HTTPS URL, ideally with OAuth in front of it. A tunnel such as MCP Warp, Cloudflare Tunnel with Access, or ngrok plus your own auth provides one; add it as a custom connector.**

If you want the same URL working in every client at once, the companion guide [One URL for your MCP server, in every client](/blog/remote-mcp-server-url/) covers claude.ai, Claude Desktop, Claude Code, ChatGPT and VS Code side by side.

## The short answer

When you add a custom connector in claude.ai, your browser doesn't talk to the MCP server. Anthropic's backend does. Anthropic's [help article on custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) puts it this way: "When you add a custom connector, Claude connects to your remote MCP server from Anthropic's cloud infrastructure, rather than from your local device." To that infrastructure, `localhost` is Anthropic's own machine, and your laptop is somewhere on a private network it has no route to.

So the URL has to be reachable from the public internet over HTTPS with a certificate a normal client trusts. Because that URL now points at your machine, you also want something deciding who may call it, and OAuth is the option claude.ai is built around.

## What the error looks like

Paste a localhost URL into a custom connector in Claude Desktop and the dialog only says "Failed to add connector". The reason is in Claude Desktop's log files (quoted from [anthropics/claude-ai-mcp #9](https://github.com/anthropics/claude-ai-mcp/issues/9)):

> Localhost URLs cannot be used because our servers cannot reach your local machine. Provide a publicly accessible MCP server URL.

There is a second variant. Claude Desktop also refuses `http://` URLs outright, even for localhost. The issue is titled:

> Claude Desktop rejects URLs with http even on localhost

and the report on [#9](https://github.com/anthropics/claude-ai-mcp/issues/9) says:

> I even tried setting up a self-signed certificate and CA, which works in my browser, but Claude Desktop won't trust it.

That issue was closed as "not planned". An Anthropic collaborator explained why in the thread: "Custom connectors added through the connector settings are reached from Anthropic's servers, not your local machine, so a `localhost` or `http://` URL would not work even if accepted."

Not everyone took that well. One commenter wrote "Codex takes an http localhost url without missing a beat." Another: "This issue forced me off Claude." Both are in [#9](https://github.com/anthropics/claude-ai-mcp/issues/9).

## Why claude.ai can't see your machine

Here is the path a custom connector request takes:

```
Your browser (claude.ai)
   │  "use connector X"
   ▼
Anthropic's servers          160.79.104.0/21
   │  HTTPS request to the connector URL
   ▼
The public internet
   │
   ▼
Your laptop                  behind a home router, no public address
```

Anthropic publishes the address range its outbound MCP calls come from. On its [IP addresses page](https://platform.claude.com/docs/en/api/ip-addresses), the outbound IPv4 range "that Anthropic uses for outbound requests (for example, when making MCP tool calls to external servers)" is `160.79.104.0/21`.

That explains every failed workaround:

- **`localhost` or `127.0.0.1`** resolves to the machine making the request, which is Anthropic's.
- **A LAN address like `192.168.1.20`** is private. Anthropic's servers have no route to it.
- **A self-signed certificate or a local CA** is trusted only by machines you configured. Your browser trusting it says nothing about Anthropic's servers.
- **A VPN or tailnet address** works for your devices only. Anthropic's help article on [custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) says it directly: "Servers hosted on a private corporate network, behind a VPN, or blocked by a firewall won't connect, even if you can reach them from your own machine."

If you want the full request path for a tunnel, [How MCP Warp works](/docs/concepts/how-mcp-warp-works/) walks through one end to end.

## What a URL needs before claude.ai will use it

### Public HTTPS with a real certificate

The hostname must resolve in public DNS, the port must be reachable from the internet, and the certificate must chain to a public CA. Let's Encrypt is fine. If you run a firewall or IP allowlist in front of the server, it has to admit `160.79.104.0/21`, per [Anthropic's IP addresses page](https://platform.claude.com/docs/en/api/ip-addresses).

### Auth that matches what you configure in the connector

The custom connector dialog has two separate auth settings, according to [Anthropic's help article](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp). Under Authentication you pick "Sign in now", "Sign in when needed" or "No sign in"; the first two run OAuth. Separately, a "Request headers" field takes fixed credentials such as an API key or bearer token that Claude sends on every request.

No sign-in means anyone who finds the URL can call your tools, on your laptop, with your permissions. A fixed header is a shared secret that lives in a connector setting. OAuth ties each call to an account and is what MCP clients discover automatically: an unauthenticated request gets a `401` with a `WWW-Authenticate` header pointing at Protected Resource Metadata (RFC 9728), and the client runs the sign-in from there. [Security](/docs/concepts/security/) covers that flow as MCP Warp implements it.

Expect some friction even when you do everything right. The [claude-ai-mcp issue tracker](https://github.com/anthropics/claude-ai-mcp/issues) has many reports of OAuth connectors failing on Anthropic's side; the companion [checklist for "Couldn't reach the MCP server"](/blog/couldnt-reach-the-mcp-server/) collects them.

### Streamable HTTP

claude.ai can't launch a process on your machine, so a server that only speaks stdio (the kind you start with `uvx something` or `npx something` in Claude Desktop's JSON config) needs a bridge to HTTP first. [Expose a stdio server](/docs/how-to/expose-a-stdio-server/) shows one way to do it.

## Your options

As of 7 October 2026. Check each project's page for current terms.

| Option | Cost | Needs your own domain | Auth handled for you | stdio | URL stays the same |
| --- | --- | --- | --- | --- | --- |
| Deploy the server to a host | Hosting cost | No, most hosts give you a subdomain | No, you build it | Needs a bridge | Yes |
| [ngrok](https://ngrok.com/docs/using-ngrok-with/using-mcp) plus your own auth | Free tier and paid plans | No, ngrok gives you a hostname | Partly (Traffic Policy rules, no MCP OAuth) | Needs a bridge | See ngrok's pricing page |
| Cloudflare Tunnel plus Access | Free | Yes, a domain on Cloudflare | You configure Access and an identity provider | Needs a bridge | Yes |
| [mcptunnels](https://github.com/terragohan/mcptunnels) | Free | No, it uses its relay's hostname | Yes, by default | Yes | No, random URL, expires after 24h |
| MCP Warp | Free (100 requests/month), then $5 or $10/month | No, URLs are under `tunnel.mcpwarp.io` | Yes, OAuth at the edge | Yes | Yes, named per server |
| [Anthropic MCP tunnels](https://claude.com/docs/connectors/mcp-tunnels/overview) | Enterprise plan only, by request | No, Anthropic assigns one | No, OAuth on each server is yours | No, Streamable HTTP only | Yes |
| [OpenAI Secure MCP Tunnel](https://github.com/openai/tunnel-client) | Free, open source | No | n/a | Yes | n/a, OpenAI products only |

A few notes on the rows:

- **Deploying** works when the server only calls cloud APIs. It doesn't work for servers that need your files, a desktop app like Blender, or a local database.
- **Cloudflare Tunnel plus Access** is free and solid, but you need a domain on Cloudflare, a Zero Trust setup, an Access application and an identity provider, plus a stdio bridge if your server needs one. [This write-up on zenn](https://zenn.dev/hideakitamai/articles/6747c9bd56bd4f?locale=en) shows what the DIY route takes, and [mcp-ferry](https://github.com/dalberto/mcp-ferry) exists to glue the pieces together.
- **mcptunnels** is the fastest free option: no account, stdio support, auth on by default. The catch is that the tunnel and its URL disappear after 24 hours, so the connector has to be re-added.
- **Anthropic's MCP tunnels** are real and first-party, but they are "available to organizations on the Claude Enterprise plan by request", need Kubernetes or Docker Compose plus cloudflared inside your network, and by default only forward to RFC 1918 private addresses ([Anthropic docs](https://claude.com/docs/connectors/mcp-tunnels/overview)).
- **OpenAI's tunnel** connects private MCP servers to "ChatGPT, Codex, the Responses API, and AgentKit" ([openai/tunnel-client](https://github.com/openai/tunnel-client)). Great if ChatGPT is your only client; it does nothing for claude.ai.

## The MCP Warp way

MCP Warp is the tunnel we build. It gives each local server a public HTTPS URL with OAuth at the edge, and it can spawn stdio servers itself. The first run has a few steps; after that it is two commands.

1. Install the CLI. On macOS or Linux with Homebrew:

   ```sh
   brew tap mcpwarp/tap
   brew trust --tap mcpwarp/tap
   brew install --cask mcpwarp
   ```

   Scoop, `.deb`, `.rpm` and `.apk` packages are in [Get started](/docs/get-started/).

2. Sign in once at [web.mcpwarp.io](https://web.mcpwarp.io) to create your account and pick a username. Skip this and `mcpwarp up` fails with `USERNAME_REQUIRED`.

3. Add your server to `~/.mcpwarp/config.json`. For a server already running Streamable HTTP on port 8765:

   ```json
   {
     "servers": [
       { "name": "notes", "kind": "http", "url": "http://127.0.0.1:8765/mcp" }
     ]
   }
   ```

   For a stdio server, use `"kind": "stdio"` with `command` and `args` instead.

4. Log in and start the tunnel:

   ```sh
   mcpwarp login
   mcpwarp up
   ```

   ```
   NAME     KIND   URL
   notes    http   https://notes-anatoly.tunnel.mcpwarp.io/mcp
   ```

5. In claude.ai, add a custom connector, paste the URL, and complete the OAuth sign-in when prompted. [Connect Claude](/docs/how-to/connect-claude/) has the details.

MCP Warp isn't certified by Anthropic; it's built to work with Claude as a standard Streamable HTTP MCP client.

## Things to know

- **`mcpwarp up` runs in the foreground.** Close it, or let the laptop sleep, and the URL returns `503` until it reconnects.
- **The Free plan is 100 requests a month and 1 server.** Every HTTP request a client makes to your URL counts, and a single chat with a few tool calls makes several. Plus ($5/month) and Pro ($10/month) remove the request cap. See [Limits and quotas](/docs/reference/limits-and-quotas/).
- **Only your account can use the URL.** The edge checks that the token belongs to the server's owner; a valid token from another account gets a `403`.

## FAQ

### Can I use http on localhost in Claude Desktop?

Not as a custom connector. The Anthropic reply on [#9](https://github.com/anthropics/claude-ai-mcp/issues/9) points to the alternative: run the server as a local stdio server in Claude Desktop's developer settings (`claude_desktop_config.json`), which connects directly on your machine.

### Does Claude Code accept localhost?

Claude Code runs on your machine, so it can reach a local server directly:

```sh
claude mcp add --transport http notes http://localhost:8765/mcp
```

The [Claude Code MCP docs](https://code.claude.com/docs/en/mcp) cover the `--transport http` option. A public URL only matters if you want the same server in claude.ai, the mobile apps or ChatGPT too.

### Is my server exposed to everyone?

With a plain tunnel and no auth, yes. With MCP Warp, every request needs a valid OAuth token belonging to you. The URL itself is only an identifier; the token is what protects the server.
