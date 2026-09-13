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

Prints the logged-in user, the issuer, and the token expiry. With `MCPWARP_TOKEN` set it prints `auth: using MCPWARP_TOKEN (personal access token)`.

- `--refresh` — force a token refresh before printing.

### `mcpwarp status`

Validates your config and shows what mcpwarp sees, without starting the tunnel.

### `mcpwarp up`

Connects, registers every configured server, prints a table of names, kinds, and public URLs, and stays in the foreground until you press Ctrl+C. Re-registers automatically after a reconnect.

You can run `mcpwarp up` on several machines under one account as long as each machine uses different server names. Run a given server name from one machine at a time: registering the same name from two machines is unsupported and the result is undefined.

```
NAME     KIND   URL
blender  stdio  https://blender-anatoly.tunnel.mcpwarp.io/mcp
notes    http   https://notes-anatoly.tunnel.mcpwarp.io/mcp
```

On an interactive terminal (stdin and stdout both a TTY), `up` runs a full-screen TUI. Otherwise — or with `--no-tui` — it prints plain lines, which is what you want in scripts, services, or CI.

- `--no-tui` — force plain line output even on a TTY.

<!-- SCREENSHOT: tui-up — mcpwarp up TUI with two servers, one stdio one http, both active, log pane open -->

*Screenshot coming: the `mcpwarp up` TUI with two active servers and the log pane open.*

Quit with `q` or Ctrl-C; shutdown is graceful, bounded at 5 seconds, and a second Ctrl-C forces it.

#### TUI keys

| Key | Action |
| --- | --- |
| `q` / `ctrl+c` | Quit |
| `?` | Help |
| `j`/`k` or arrows | Select a server |
| `l` | Toggle the log pane |
| `pgup`/`pgdn` or `ctrl+u`/`ctrl+d` | Scroll logs |
| `r` | Restart the selected server (stdio only) |
| `d` | Disable the selected server (stops the child, unregisters it) |
| `e` | Enable the selected server |

Columns: NAME, KIND, STATE, RESTARTS, URL. STATE is one of `active`, `restarting`, `failed`, `disabled`, `stopped`. A locally disabled server shows as absent — not paused — in the dashboard.

<!-- SCREENSHOT: tui-up-restart — TUI with a stdio server in restarting state after pressing r -->

*Screenshot coming: the TUI showing a stdio server in `restarting` state after pressing `r`.*

### `mcpwarp dashboard`

Prints the dashboard URL, then opens it in your browser.

## Global flags

- `--config <path>` — path to the config file (default `~/.mcpwarp/config.json`).
- `--issuer <url>` — override the auth issuer URL.
- `--connect-url <url>` — override the tunnel connect URL.
- `--verbose` — verbose logging (never includes tokens).
- `--version` — print the CLI version.

## Exit codes

- `0` — clean exit.
- `1` — runtime failure.
- `2` — bad usage or invalid config.
- `130` — interrupted (SIGINT).
- `143` — terminated (SIGTERM).

See [Environment variables](/docs/reference/environment-variables/) for the env var equivalents of `--issuer` and `--connect-url`, and [Troubleshooting](/docs/how-to/troubleshooting/) for what error messages mean.
