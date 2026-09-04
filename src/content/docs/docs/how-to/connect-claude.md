---
title: Connect Claude
description: Connect an MCP Warp URL to claude.ai, Claude Desktop, or Claude Code.
---

**Once `mcpwarp up` prints a URL for your server, add it to Claude as a remote MCP server and complete the OAuth sign-in when prompted.**

## claude.ai (web) and Claude Desktop

Add a custom connector / remote MCP server and paste the URL from your `mcpwarp up` table. Complete the OAuth sign-in when prompted — this is the standard MCP OAuth flow, and it authorizes that specific Claude account against that specific server.

## Claude Code

Use `claude mcp add` with the HTTP transport:

```sh
claude mcp add --transport http <name> <url>
```

For example:

```sh
claude mcp add --transport http notes https://91bcf40a.mcpwarp.io/mcp
```

Claude Code will run through the OAuth flow the first time it connects.
