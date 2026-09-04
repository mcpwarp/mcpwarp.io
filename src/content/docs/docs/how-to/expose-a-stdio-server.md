---
title: Expose a stdio server
description: Configure mcpwarp to spawn a local MCP server and expose it over stdio.
---

**Use `"kind": "stdio"` when your MCP server is a command mcpwarp should spawn itself and talk to over stdin/stdout.**

## Add the server to your config

```json title="~/.mcpwarp/config.json"
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

- `command` — the executable to run.
- `args` — arguments passed to it.
- `env` — extra environment variables for the child process.
- `name` — must match `^[a-z0-9][a-z0-9-]*$` and be unique in your config. Renaming a server mints a brand-new URL; the old one stops working.

## Start it

```sh
mcpwarp status   # validate the config first
mcpwarp up
```

`mcpwarp up` spawns the command, speaks MCP over its stdin/stdout, and gives it a public URL:

```
NAME     KIND   URL
blender  stdio  https://7f3a1c2e.mcpwarp.io/mcp
```

## How the stdio bridge works

Each stdio server gets a small local HTTP endpoint that turns Streamable HTTP requests into newline-delimited JSON-RPC on the child process's stdin/stdout. It classifies messages by shape, so it supports both session-based MCP and the stateless 2026-07-28 generation of the protocol.

## Limitations

- No SSE resumability — there's no Last-Event-ID or replay, so a client has to re-issue a request if a stream drops.
- On Windows, process cleanup is best-effort and only the direct child is killed.
- On Windows, `.cmd`/`.bat` shims aren't launched directly — point `command` at the underlying `.js` file via `node` instead.
- If the child crashes 10 times in a row without a 60-second healthy run, mcpwarp stops restarting it and requests get a 502 with "local server '&lt;name&gt;' is not running". Run with `--verbose` to see why it's crashing.
