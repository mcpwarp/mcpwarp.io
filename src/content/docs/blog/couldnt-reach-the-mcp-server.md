---
title: "\"Couldn't reach the MCP server\" in Claude: a checklist"
date: 2026-10-08
excerpt: 'Claude says "Couldn''t reach the MCP server" but your server runs. Check in order: URL, inbound requests, transport, OAuth, IP allowlist.'
description: 'Claude says "Couldn''t reach the MCP server" but your server runs. Check in order: URL, inbound requests, transport, OAuth, IP allowlist.'
authors: anatoly
draft: false
---

**"Couldn't reach the MCP server" means Claude's servers couldn't complete a connection to your URL. Check in order: the URL is public HTTPS (localhost won't work); a request reaches your server; the endpoint speaks Streamable HTTP; if you use OAuth, an unauthenticated request returns 401 with discovery metadata; nothing blocks Anthropic's IP range, 160.79.104.0/21.**

This checklist works with any server and any tunnel. Each item has a test you can run yourself. For the client-by-client setup steps, see [One URL for your MCP server, in every client](/blog/remote-mcp-server-url/).

## What the error means

The full message in claude.ai and Claude Desktop reads like this (from [anthropics/claude-ai-mcp #227](https://github.com/anthropics/claude-ai-mcp/issues/227)):

> Couldn't reach the MCP server. You can check the server URL and verify the server is running. If this persists, share this reference with support: `ofid_c58995a431270861`

When you click Connect, Anthropic's servers make the request. Anthropic's [help article on custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) says "Claude connects to your remote MCP server from Anthropic's cloud infrastructure, rather than from your local device." So `curl` working from your laptop proves less than it seems.

The message is a catch-all. DNS, TLS, firewalls, the wrong transport and a broken OAuth discovery step can all end up here. Keep the `ofid_` reference from each attempt; you'll want it if you report the problem.

Some failures are on Anthropic's side. Several reports in the issue tracker show fully working servers that never receive a request. A different tunnel won't fix those, and it's worth knowing before you spend an evening rewriting your auth.

## First, did any request arrive?

This one test splits the list in half. Open your server logs, or your reverse proxy or tunnel logs, and click Connect in Claude. Then look for any request to your hostname in that minute:

- `GET` or `POST` to `/mcp`
- `GET /.well-known/oauth-protected-resource` (or `/.well-known/oauth-protected-resource/mcp`)
- `GET /.well-known/oauth-authorization-server`

If nothing arrived, the problem is between Anthropic and your server, or inside Anthropic. If something arrived, the problem is in what your server answered.

The reporter on [#227](https://github.com/anthropics/claude-ai-mcp/issues/227) saw the worst case: "zero inbound requests from Anthropic on every `Connect` click", even though the same server worked end to end in Cursor and Postman. That issue was closed as "not planned".

## If nothing arrived

### The URL is localhost, a LAN address or plain http

`localhost`, `127.0.0.1`, `192.168.x.x`, `10.x.x.x` and tailnet-only names point at nothing Anthropic's servers can reach. For localhost, Claude Desktop refuses the URL up front: the dialog says "Failed to add connector", and the log files give the reason ([#9](https://github.com/anthropics/claude-ai-mcp/issues/9)):

> Localhost URLs cannot be used because our servers cannot reach your local machine. Provide a publicly accessible MCP server URL.

It rejects `http://` URLs too. [Why claude.ai can't connect to your local MCP server](/blog/claude-ai-localhost-mcp-server/) explains the mechanism and the ways around it.

Test from a network that isn't yours, for example a phone hotspot or a cheap VPS:

```sh
curl -sv -o /dev/null https://mcp.example.com/mcp
```

Look for a resolved public address and a completed TLS handshake.

### Tailscale Funnel

Tailscale Funnel does put a service on the public internet, so it can work in principle. In practice there are open reports of it failing with claude.ai. [#953](https://github.com/anthropics/claude-ai-mcp/issues/953) is titled "Custom MCP connector consistently fails with "Couldn't reach the MCP server"" and describes a Funnel-hosted server "being fully reachable and functional from outside". [#864](https://github.com/anthropics/claude-ai-mcp/issues/864) reports "Authorization with the MCP server failed" through Funnel, after the setup had worked the day before.

Two things to keep in mind. claude.ai can't join your tailnet, so only Funnel (public) URLs are candidates, never plain tailnet addresses. And Funnel adds no auth of its own; whatever protects the server has to be in the server or a proxy in front of it.

### A firewall or IP allowlist

If you allowlist inbound traffic, the range to admit is Anthropic's outbound IPv4 range, `160.79.104.0/21`, published on Anthropic's [IP addresses page](https://platform.claude.com/docs/en/api/ip-addresses). The same page lists phased-out addresses (`34.162.46.92/32` and four others). An allowlist written before the change may only contain those.

An outbound tunnel avoids the question: your machine dials out, and nothing needs an inbound rule.

### A bot or WAF rule at the edge

A CDN can block the request before it reaches your origin, so your origin logs show nothing. In [#76](https://github.com/anthropics/claude-ai-mcp/issues/76), the cause was Cloudflare's managed rule "Block AI training bots", which "blocks the `Claude-User` user agent with a 403 at the edge before requests reach the origin server." Check your CDN's firewall events as well as your server logs.

### Certificate problems

Self-signed certificates and private CAs are trusted only on machines you configured. The reporter on [#9](https://github.com/anthropics/claude-ai-mcp/issues/9) tried exactly that: "I even tried setting up a self-signed certificate and CA, which works in my browser, but Claude Desktop won't trust it." Use a certificate from a public CA such as Let's Encrypt, and serve the full chain.

```sh
openssl s_client -connect mcp.example.com:443 -servername mcp.example.com </dev/null
```

`Verify return code: 0 (ok)` is what you want.

## If requests arrived but it still fails

### Wrong transport or path

Custom connectors expect Streamable HTTP at the URL you paste, usually ending in `/mcp`. A server that only speaks the legacy 2024-11-05 HTTP+SSE transport (`GET /sse` plus `POST /messages`) is a common mismatch, as is pasting the host without the path.

Send an `initialize` request by hand:

```sh
curl -i -X POST https://mcp.example.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

A server without auth should answer `200` with a JSON-RPC result. A `404` or `405` means the path or transport is wrong. If your server is behind MCP Warp, [Expose an HTTP server](/docs/how-to/expose-an-http-server/) covers the same requirement: Streamable HTTP only, no legacy SSE.

### Broken OAuth discovery

If your server uses OAuth, the unauthenticated request above should get a `401` with a `WWW-Authenticate` header pointing at Protected Resource Metadata (RFC 9728). That's how MCP clients find the authorization server. It should look roughly like this:

```
HTTP/2 401
www-authenticate: Bearer resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource/mcp"
```

Then fetch the metadata it points at:

```sh
curl -s https://mcp.example.com/.well-known/oauth-protected-resource/mcp
```

It should return JSON with `resource` matching your MCP URL and an `authorization_servers` list.

A `401` without that header is a common trap. On [#953](https://github.com/anthropics/claude-ai-mcp/issues/953), a commenter who ran the URL through a checker reported that the server answered "`401` with no `WWW-Authenticate` header and no `/.well-known/oauth-protected-resource` document", and suggested that Claude started OAuth, found no metadata, and showed "Couldn't reach". Judging by the issue body ("401 without token, 200 with correct token"), that server appears to have used a static token.

If you protect your server with a fixed API key or bearer token, configure it in the connector itself. Anthropic's [help article](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) describes a "Request headers" setting for "fixed credentials such as API keys that Claude sends on every request". For how MCP Warp does the OAuth side, see [Security](/docs/concepts/security/).

### "Authorization with the MCP server failed"

This is the neighbouring error. Claude reached the server, started OAuth, and something in the flow failed. The issue tracker has many reports with that error, for example [#978](https://github.com/anthropics/claude-ai-mcp/issues/978) and [#864](https://github.com/anthropics/claude-ai-mcp/issues/864).

Things worth checking on your side:

- The `resource` value in your Protected Resource Metadata matches the URL in the connector exactly, including the path.
- Your authorization server accepts `https://claude.ai/api/mcp/auth_callback` as a redirect URI.
- Your token endpoint is reachable from the internet, and admits Anthropic's IP range if you allowlist.

In #864 the server logged a successful authorize step and a redirect back to Claude, then no `/token` request at all. If your logs look like that, the failure is likely past your server. Report it with the `ofid_` references.

A related symptom: [#457](https://github.com/anthropics/claude-ai-mcp/issues/457) reports a public server with no auth where claude.ai still tried to register with a sign-in service and failed with "Couldn't register with CBETA_search_by_mcp's sign-in service".

### Connected, but no tools

Sometimes OAuth completes and the connector still never shows as Connected. [claude-code #88831](https://github.com/anthropics/claude-code/issues/88831) describes this: the token exchange succeeds on the server, but the connector backend "never follows up with a request to the MCP resource endpoint itself". If your logs show a successful `/token` response and no authenticated `/mcp` request after it, you're likely looking at the same thing.

## If you use MCP Warp

MCP Warp is the tunnel we build. If your URL is a `*.tunnel.mcpwarp.io/mcp` address, check the status code at the URL first. From [Troubleshooting](/docs/how-to/troubleshooting/):

| Status at the URL | Meaning | Fix |
| --- | --- | --- |
| `503` | The server is enabled, but no `mcpwarp up` is connected for it. | Start `mcpwarp up` on the machine that hosts the server. |
| `404` | Unknown subdomain, or the server is disabled in the dashboard. | Check the URL; check the server's status in the dashboard. |
| `429` | The plan's request quota is used up for this month. | Upgrade, or wait for the reset at the start of the UTC month. |
| `502` | A stdio server crashed 10 times in a row without a 60-second healthy run. | Run `mcpwarp up --verbose`, fix the server, restart. |

MCP Warp takes care of the public HTTPS URL, the certificate, inbound firewall rules (the tunnel is outbound from your machine), and OAuth discovery: an unauthenticated request gets a `401` with a `WWW-Authenticate` header pointing at Protected Resource Metadata. It can't fix failures inside Anthropic's connector backend.

Getting there takes a one-time setup: install the CLI, sign in at [web.mcpwarp.io](https://web.mcpwarp.io) to choose a username, and add the server to `~/.mcpwarp/config.json`. After that it's two commands:

```sh
mcpwarp login
mcpwarp up
```

[Get started](/docs/get-started/) has the full walkthrough. The Free plan is 100 requests a month and 1 server, and every request a client makes counts.

## Still stuck

Open an issue on [anthropics/claude-ai-mcp](https://github.com/anthropics/claude-ai-mcp/issues), after searching for your symptom. Include:

- The `ofid_` reference for each attempt, with the time and timezone.
- Whether any request arrived, and which paths, with timestamps.
- The full response headers of an unauthenticated `POST` to your MCP URL, including `WWW-Authenticate`.
- The body of your Protected Resource Metadata.
- Your transport and client registration type (none, static, or dynamic client registration).

Redact tokens and anything private before you post.
