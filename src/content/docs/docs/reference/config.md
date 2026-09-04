---
title: Config reference
description: The mcpwarp config.json schema, both server kinds, and naming rules.
---

**`~/.mcpwarp/config.json` (or a path passed via `--config`) lists the servers mcpwarp should expose. Each entry is either `stdio` or `http`.**

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
| `command` | yes | Executable to spawn. |
| `args` | no | Arguments array. |
| `env` | no | Extra environment variables for the child. |
| `cwd` | no | Working directory for the child. |

## `http` servers

mcpwarp proxies to an already-running Streamable HTTP MCP server. The legacy 2024-11-05 HTTP+SSE transport (`GET /sse` + `POST /messages`) is not supported.

| Field | Required | Description |
| --- | --- | --- |
| `name` | yes | See naming rules below. |
| `kind` | yes | `"http"` |
| `url` | yes | The local Streamable HTTP endpoint to proxy to. |

## Naming rules

- `name` must match `^[a-z0-9][a-z0-9-]*$`.
- `name` must be unique within the config.
- Renaming a server mints a brand-new public URL. The old URL stops working — update any client using it.
- Reusing the same `name` for a server with a different `kind` produces a `CONFLICT` error; see [Troubleshooting](/docs/how-to/troubleshooting/).

## Validating a config

```sh
mcpwarp status --config <path>
```

Invalid config exits with code `2` and lists the paths that failed validation.
