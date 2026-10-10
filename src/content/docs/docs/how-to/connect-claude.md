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
claude mcp add --transport http notes https://notes-anatoly.tunnel.mcpwarp.io/mcp
```

Claude Code will run through the OAuth flow the first time it connects.

<!-- SCREENSHOT: claude-connect — Claude.ai custom connector dialog with a *.tunnel.mcpwarp.io/mcp URL -->

*Screenshot coming: the Claude.ai custom connector dialog with a `*.tunnel.mcpwarp.io/mcp` URL.*

MCP Warp isn't certified by Anthropic — it's built to work with Claude (claude.ai, Claude Desktop, Claude Code) as a standard Streamable HTTP MCP client.
