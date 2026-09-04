---
title: Connect other clients
description: Connect an MCP Warp URL to Cursor, VS Code, or any Streamable HTTP MCP client.
---

**Any client that speaks Streamable HTTP MCP can use an MCP Warp URL directly — point it at the URL and let it run the OAuth flow.**

## Cursor

Add the server to `mcp.json` with a `url`:

```json title="mcp.json"
{
  "mcpServers": {
    "notes": {
      "url": "https://91bcf40a.mcpwarp.io/mcp"
    }
  }
}
```

## VS Code

Add the server to `.vscode/mcp.json` with `"type": "http"`:

```json title=".vscode/mcp.json"
{
  "servers": {
    "notes": {
      "type": "http",
      "url": "https://91bcf40a.mcpwarp.io/mcp"
    }
  }
}
```

## Any other Streamable HTTP client

Add a remote MCP server pointing at the URL from your `mcpwarp up` table, and complete the OAuth sign-in when the client prompts for it. The legacy 2024-11-05 HTTP+SSE transport is not involved — mcpwarp URLs speak Streamable HTTP.
