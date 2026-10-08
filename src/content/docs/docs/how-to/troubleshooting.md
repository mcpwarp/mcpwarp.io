---
title: Troubleshooting
description: What mcpwarp's error messages mean and how to fix them.
---

**Look up the message you're seeing to find out what it means and how to fix it.**

The tables below are split by where you see the message: at your public URL (what your MCP
client sees) versus in the terminal (what `mcpwarp up` itself prints). The same underlying event
can look different in each place — for example, a server disabled in the dashboard shows up as a
`404` to your MCP client, but as `service disabled` (`503`) in the `mcpwarp up` terminal.

### At the public URL (your MCP client sees this)

| HTTP status | Meaning | Fix |
| --- | --- | --- |
| `404` | Unknown subdomain, or the server is disabled in the dashboard. | Check the URL is correct; check the server's status in the dashboard. |
| `429` `{"error":"quota_exceeded",...}` | Your plan's per-request quota is used up for this period. | Upgrade your plan, or wait for the reset. See [Limits and quotas](/docs/reference/limits-and-quotas/) and [Manage your subscription](/docs/how-to/billing/). |
| `502` | The local server crashed past the restart cap and `mcpwarp up` gave up restarting it. | See `local server '<name>' is not running` below. |
| `503` | The server is enabled, but no `mcpwarp up` is currently connected for it (agent offline). | Make sure `mcpwarp up` is running and connected on the machine that hosts this server. |

### From `mcpwarp` in your terminal

| Message | Meaning | Fix |
| --- | --- | --- |
| `Not logged in. Run mcpwarp login.` | No stored credentials. | Run `mcpwarp login`. |
| `session expired, run mcpwarp login` | The refresh token was rejected (revoked, expired, or already used), or the tunnel rejected your session. The stored session is dead, so `mcpwarp up` exits. | Run `mcpwarp login` again, then rerun `mcpwarp up`. |
| `could not refresh the session token; retrying` | The session token needed a refresh, but the auth server couldn't be reached — for example, your laptop woke from sleep before the network was back, or the auth server is down. The underlying error follows on the same line. The CLI doesn't exit — it keeps retrying with randomized backoff (each wait is a random time up to 1s, then up to 2s, 4s, and so on, capped at 30s) until the auth server answers. | Nothing to fix; it reconnects on its own. Press Ctrl-C to stop it. |
| `could not acquire the refresh lock ...` (as the error in the `retrying` warning above) | Another `mcpwarp` process on this machine holds the lock on your credentials file while it refreshes the token, and it's slow or crashed mid-refresh. The message names the lock file, which sits next to your credentials file under `~/.mcpwarp/credentials/` with a `.lock` suffix, and the holder (`pid N`, or `another process`). The CLI keeps retrying with the same backoff. | Wait for the other process to finish. If it's gone, delete the `.lock` file named in the message; the next retry picks it up. |
| `upgrade mcpwarp` | The tunnel rejected your envelope version. | Update to the latest `mcpwarp`. |
| `local server '<name>' is not running` (502) | The stdio child crashed past the restart cap (10 consecutive crashes without a 60s healthy run). | Check `mcpwarp up --verbose`, fix the underlying server, restart. |
| `unknown service` (404) | The tunnel edge doesn't recognize the Host header. | Misconfiguration on the tunnel side — check the URL is correct. |
| `service disabled` (503) | The tunnel has disabled this server (dashboard toggle-off, or a backend policy decision). Your MCP client will see `404` at the public URL. | Check your account and re-enable if needed; it resumes without a restart. |
| `bad request` (400/431) | The request head was malformed. | Run with `--verbose` for details. |
| `QUOTA_EXCEEDED ... Upgrade your plan at web.mcpwarp.io/settings` | Your plan's server limit is reached (this is a `register` rejection, not the per-request quota above). | Upgrade to Pro, or remove a server. See [Limits and quotas](/docs/reference/limits-and-quotas/) and [Manage your subscription](/docs/how-to/billing/). |
| `CONFLICT` | A server with the same name is already registered under a different kind. | Rename the server, or fix the `kind` in your config. |
| `SERVER_DISABLED` | The server is disabled in the dashboard. | The CLI waits for you to re-enable it in the dashboard. |
| `INVALID_NAME` | The server's `name` doesn't match the naming rules. | Fix the slug — see [Config reference](/docs/reference/config/). |
| `USERNAME_REQUIRED` | Your account doesn't have a username yet. | Sign in once at [web.mcpwarp.io](https://web.mcpwarp.io) to choose a username, then rerun `mcpwarp up`. |
| `UNSUPPORTED_VERSION` | Your `mcpwarp` build is too old for the tunnel. | Upgrade `mcpwarp`. |
| `CONNECTION_LIMIT ... (limit 10)` | 10 `mcpwarp up` agents are already connected on your account, so this one was refused. The CLI doesn't exit — it keeps retrying and reconnects on its own once a slot frees up. | Close another `mcpwarp up`; this one reconnects on its next retry. See [Limits and quotas](/docs/reference/limits-and-quotas/). |
| `TOO_MANY_SERVICES` | Your config has more than 100 servers. Nothing in that batch registered; the connection stays open. This is the per-config cap, not your plan's server limit. | Trim the config to 100 or fewer servers and restart. See [Limits and quotas](/docs/reference/limits-and-quotas/). |
| Config validation error (exit code 2) | Your config file has a problem. | Fix the listed paths, then run `mcpwarp status --config <path>` to re-check. |
| `new public URL assigned to <name>` | Informational — first registration, or the server was renamed. | Nothing to fix. |
| Warning about a name reusing a different id | The same `name` was previously used for a different server identity. | Investigate before assuming it's the server you expect. |

## Exit codes

- `0` — clean exit.
- `1` — runtime or auth failure.
- `2` — bad usage or invalid config.
- `130` — interrupted (SIGINT).
- `143` — terminated (SIGTERM).

## Still stuck?

See [Get help](/docs/get-help/).
