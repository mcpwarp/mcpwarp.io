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
| `429` `{"error":"quota_exceeded",...}` | Your plan's per-request quota is used up for this period. | Upgrade, or wait for the reset. See [Limits and quotas](/docs/reference/limits-and-quotas/). |
| `502` | The local server crashed past the restart cap and `mcpwarp up` gave up restarting it. | See `local server '<name>' is not running` below. |
| `503` | The server is enabled, but no `mcpwarp up` is currently connected for it (agent offline). | Make sure `mcpwarp up` is running and connected on the machine that hosts this server. |

### From `mcpwarp` in your terminal

| Message | Meaning | Fix |
| --- | --- | --- |
| `Not logged in. Run mcpwarp login.` | No stored credentials. | Run `mcpwarp login`. |
| `run mcpwarp login` (after an auth failure) | The refresh token was rejected, or a second request also got a 401. | Run `mcpwarp login` again. |
| `upgrade mcpwarp` | The tunnel rejected your envelope version. | Update to the latest `mcpwarp`. |
| `local server '<name>' is not running` (502) | The stdio child crashed past the restart cap (10 consecutive crashes without a 60s healthy run). | Check `mcpwarp up --verbose`, fix the underlying server, restart. |
| `unknown service` (404) | The tunnel edge doesn't recognize the Host header. | Misconfiguration on the tunnel side — check the URL is correct. |
| `service disabled` (503) | The tunnel has disabled this server (dashboard toggle-off, or a backend policy decision). Your MCP client will see `404` at the public URL. | Check your account and re-enable if needed; it resumes without a restart. |
| `bad request` (400/431) | The request head was malformed. | Run with `--verbose` for details. |
| `QUOTA_EXCEEDED ... Upgrade your plan at <web-url>/settings` | Your plan's server limit is reached (this is a `register` rejection, not the per-request quota above). | Upgrade, or remove a server. See [Limits and quotas](/docs/reference/limits-and-quotas/). |
| `CONFLICT` | A server with the same name is already registered under a different kind. | Rename the server, or fix the `kind` in your config. |
| `SERVER_DISABLED` | The server is disabled in the dashboard. | Re-enable it in the dashboard. |
| Config validation error (exit code 2) | Your config file has a problem. | Fix the listed paths, then run `mcpwarp status --config <path>` to re-check. |
| `new public URL assigned to <name>` | Informational — first registration, or the server was renamed. | Nothing to fix. |
| Warning about a name reusing a different id | The same `name` was previously used for a different server identity. | Investigate before assuming it's the server you expect. |

## Exit codes

- `0` — clean exit.
- `1` — runtime or auth failure.
- `2` — bad usage or invalid config.

## Still stuck?

See [Get help](/docs/get-help/).
