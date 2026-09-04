---
title: Environment variables
description: Every environment variable mcpwarp reads, and its default.
---

**All of these have sane defaults for the hosted MCP Warp service — you only need them for testing against a different environment.**

| Variable | Default | Description |
| --- | --- | --- |
| `MCPWARP_AUTH_URL` | `https://auth.mcpwarp.io` | The auth server used for `mcpwarp login`. |
| `MCPWARP_AUTH_REALM` | `mcpwarp` | The auth realm. |
| `MCPWARP_AUTH_CLIENT_ID` | `mcpwarp-cli` | The OAuth client ID the CLI authenticates as. |
| `MCPWARP_CONNECT_URL` | `wss://connect.mcpwarp.io` | The tunnel WebSocket endpoint `mcpwarp up` connects to. |
| `MCPWARP_WEB_URL` | `https://mcpwarp.io` | The web app URL used in messages (for example, quota errors). |

`--issuer` and `--connect-url` (see [CLI reference](/docs/reference/cli/)) override `MCPWARP_AUTH_URL` and `MCPWARP_CONNECT_URL` respectively for a single invocation.
