---
title: Why one subdomain per server
description: Why MCP Warp gives every server its own subdomain instead of a shared host with different paths.
---

**Every server you expose gets its own subdomain — `https://<id>.mcpwarp.io/mcp` — instead of a path under one shared host.**

The reason is how MCP clients handle OAuth. Clients like VS Code Copilot and Claude Desktop derive their OAuth credential cache from the request's origin (scheme + host + port), not from the full URL. If two different MCP servers lived at different paths under the same host — `mcpwarp.io/server-a` and `mcpwarp.io/server-b` — a client would treat them as the same origin and could reuse (or clobber) OAuth credentials meant for one server against the other.

Giving each server its own subdomain gives it its own origin, so credential caches never collide, regardless of how many servers you or anyone else has running.
