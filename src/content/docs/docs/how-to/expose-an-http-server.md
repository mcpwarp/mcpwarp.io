---
title: Expose an HTTP server
description: Configure mcpwarp to proxy an already-running Streamable HTTP MCP server.
---

**Use `"kind": "http"` when you already have a Streamable HTTP MCP server running locally and just want mcpwarp to proxy it.**

## Add the server to your config

```json title="~/.mcpwarp/config.json"
{
  "servers": [
    { "name": "notes", "kind": "http", "url": "http://127.0.0.1:8765/mcp" }
  ]
}
```

- `url` — the local Streamable HTTP endpoint mcpwarp should proxy to.
- `name` — must match `^[a-z0-9][a-z0-9-]*$` and be unique in your config. Renaming a server mints a brand-new URL; the old one stops working.

The legacy 2024-11-05 HTTP+SSE transport (a `GET /sse` endpoint plus `POST /messages`) is **not** supported. Your server needs to speak Streamable HTTP.

## Start it

```sh
mcpwarp status   # validate the config first
mcpwarp up
```

```
NAME   KIND   URL
notes  http   https://91bcf40a.mcpwarp.io/mcp
```

mcpwarp proxies requests to your local server and streams the response back end to end, with backpressure.
