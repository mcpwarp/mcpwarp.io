---
title: Security
description: No anonymous access, OAuth, owner checks, and what the CLI never sees.
---

**Every request to a public MCP Warp URL must carry a valid OAuth bearer token belonging to the server's owner — there is no anonymous access.**

## No anonymous access

An unauthenticated request gets a 401 with a `WWW-Authenticate` header pointing at the server's Protected Resource Metadata (RFC 9728). MCP clients use this to discover the auth server automatically and run the standard OAuth flow — you don't configure anything for this to work.

The URL itself is an identifier, not a secret. It's the OAuth token that protects the server.

## Owner check

The tunnel edge doesn't just check that a token is valid — it checks that the token's user is the owner of that specific server. A valid token for someone else's account gets a 403, not access.

## What the CLI never sees

The tunnel terminates auth at the edge. The LLM client's OAuth token is verified there and never forwarded to `mcpwarp up` or to your local MCP server. Your local server's credentials, in turn, never reach the LLM client. The two sides don't share a trust boundary.

## Credential storage

`mcpwarp login` credentials are stored per-issuer under `~/.mcpwarp/credentials/`, written with a temp-file-plus-rename so a crash can't leave a partial file, and set to file mode `0600`. Tokens are never logged, including with `--verbose`.
