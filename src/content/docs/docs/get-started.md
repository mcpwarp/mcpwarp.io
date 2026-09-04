---
title: Get started
description: Install mcpwarp, log in, and expose your first MCP server in about five minutes.
---

**This page takes you from nothing installed to a public URL for a local MCP server, in about five minutes.**

## Install

MCP Warp is a CLI, distributed as the `mcpwarp` npm package. Node 20+ is required.

```sh
npm install -g mcpwarp
```

Or run it without installing:

```sh
npx mcpwarp up
```

## Log in

```sh
mcpwarp login
```

This opens your browser for a device-flow login. If a browser can't be opened (for example, over SSH), pass `--no-browser` and it prints a URL and a code to enter manually:

```sh
mcpwarp login --no-browser
```

Credentials are stored per-issuer under `~/.mcpwarp/credentials/`, mode `0600`.

## Configure a server

MCP Warp reads `~/.mcpwarp/config.json` (override with `--config <path>`). Add the server you want to expose:

```json title="~/.mcpwarp/config.json"
{
  "servers": [
    { "name": "notes", "kind": "http", "url": "http://127.0.0.1:8765/mcp" }
  ]
}
```

Use `"kind": "stdio"` instead if you want mcpwarp to spawn the server itself — see [Expose a stdio server](/docs/how-to/expose-a-stdio-server/) and [Expose an HTTP server](/docs/how-to/expose-an-http-server/) for both shapes in full.

Check your config is valid before starting anything:

```sh
mcpwarp status
```

## Start the tunnel

```sh
mcpwarp up
```

`mcpwarp up` connects, registers every configured server, and prints a table of public URLs. It stays in the foreground until you press Ctrl+C.

```
NAME     KIND   URL
notes    http   https://91bcf40a.mcpwarp.io/mcp
```

## Paste the URL into a client

Copy the URL from the table and add it to your MCP client as a remote MCP server (custom connector / remote server / `mcp.json`, depending on the client). The client will run through an OAuth sign-in the first time it connects.

See [Connect Claude](/docs/how-to/connect-claude/), [Connect ChatGPT](/docs/how-to/connect-chatgpt/), or [Connect other clients](/docs/how-to/connect-other-clients/) for client-specific steps.
