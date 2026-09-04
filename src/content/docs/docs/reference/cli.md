---
title: CLI reference
description: Every mcpwarp command, its flags, and exit codes.
---

**Reference for every `mcpwarp` command, its flags, and what its exit codes mean.**

## Commands

### `mcpwarp login`

Opens the browser for a device-flow login against the MCP Warp auth server. Stores credentials under `~/.mcpwarp/credentials/` (mode `0600`).

- `--no-browser` — print the URL and code instead of opening a browser.

### `mcpwarp logout`

Removes stored credentials.

### `mcpwarp whoami`

Prints the logged-in identity.

- `--refresh` — force a token refresh before printing.

### `mcpwarp status`

Validates your config and shows what mcpwarp sees, without starting the tunnel.

### `mcpwarp up`

Connects, registers every configured server, prints a table of names, kinds, and public URLs, and stays in the foreground until you press Ctrl+C. Re-registers automatically after a reconnect. You can run `mcpwarp up` from two machines at once.

```
NAME     KIND   URL
blender  stdio  https://7f3a1c2e.mcpwarp.io/mcp
notes    http   https://91bcf40a.mcpwarp.io/mcp
```

## Global flags

- `--config <path>` — path to the config file (default `~/.mcpwarp/config.json`).
- `--issuer <url>` — override the auth issuer URL.
- `--connect-url <url>` — override the tunnel connect URL.
- `--verbose` — verbose logging (never includes tokens).

## Exit codes

- `0` — clean exit.
- `1` — runtime or auth failure.
- `2` — bad usage or invalid config.

See [Environment variables](/docs/reference/environment-variables/) for the env var equivalents of `--issuer` and `--connect-url`, and [Troubleshooting](/docs/how-to/troubleshooting/) for what error messages mean.
