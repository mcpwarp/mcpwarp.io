---
title: Config reference
description: The mcpwarp config.json schema, both server kinds, and naming rules.
---

**`~/.mcpwarp/config.json` (or a path passed via `--config`) lists the servers mcpwarp should expose. Each entry is either `stdio` or `http`.**

The top level must be exactly `{"servers": [...]}`, non-empty. Unknown top-level keys are rejected, and duplicate server names are rejected.

## Shape

```json title="~/.mcpwarp/config.json"
{
  "servers": [
    {
      "name": "blender",
      "kind": "stdio",
      "command": "uvx",
      "args": ["blender-mcp"],
      "env": { "BLENDER_PATH": "/Applications/Blender.app" }
    },
    {
      "name": "notes",
      "kind": "http",
      "url": "http://127.0.0.1:8765/mcp"
    }
  ]
}
```

## `stdio` servers

mcpwarp spawns `command` with `args`, `env`, and (optionally) `cwd`, and speaks MCP over the child's stdin/stdout.

| Field | Required | Description |
| --- | --- | --- |
| `name` | yes | See naming rules below. |
| `kind` | yes | `"stdio"` |
| `command` | yes | Executable to spawn, resolved on `PATH`. Run directly, not through a shell. |
| `args` | no | Arguments array. |
| `env` | no | Extra environment variables for the child, merged onto the process environment. Config wins on conflicts. No `${VAR}` expansion — values are used literally. |
| `cwd` | no | Working directory for the child. |

## `http` servers

mcpwarp proxies to an already-running Streamable HTTP MCP server. The legacy 2024-11-05 HTTP+SSE transport (`GET /sse` + `POST /messages`) is not supported.

| Field | Required | Description |
| --- | --- | --- |
| `name` | yes | See naming rules below. |
| `kind` | yes | `"http"` |
| `url` | yes | The local Streamable HTTP endpoint to proxy to. `http(s)` only, no query string. |

There's no way to attach headers or a bearer token to an `http` target — mcpwarp only proxies to plain local endpoints.

## Naming rules

- `name` must match `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, 1–30 characters.
- `name` must be unique within the config.
- `name` is also the public URL slug — the server's URL is `https://<name>-<username>.tunnel.mcpwarp.io/mcp`, where `<username>` is your account's username.
- Renaming a server assigns a brand-new public URL. The old URL doesn't just stop working — it lingers offline in the dashboard until you delete it there.
- Reusing the same `name` for a server with a different `kind` produces a `CONFLICT` error; see [Troubleshooting](/docs/how-to/troubleshooting/).

## Validating a config

```sh
mcpwarp status --config <path>
```

Invalid config exits with code `2` and lists the paths that failed validation.
