---
title: Connect other clients
description: Connect an MCP Warp URL to VS Code or any Streamable HTTP MCP client.
---

**Any client that speaks Streamable HTTP MCP can use an MCP Warp URL directly — point it at the URL and let it run the OAuth flow.**

MCP Warp isn't certified by any client vendor — it's built to work with any standard Streamable HTTP MCP client.

## VS Code

Add the server to `.vscode/mcp.json` with `"type": "http"`:

```json title=".vscode/mcp.json"
{
  "servers": {
    "notes": {
      "type": "http",
      "url": "https://notes-anatoly.tunnel.mcpwarp.io/mcp"
    }
  }
}
```

## Any other Streamable HTTP client

Add a remote MCP server pointing at the URL from your `mcpwarp up` table, and complete the OAuth sign-in when the client prompts for it. The legacy 2024-11-05 HTTP+SSE transport is not involved — mcpwarp URLs speak Streamable HTTP.
