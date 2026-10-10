---
title: Connect a local MCP server to ChatGPT
description: Give a local MCP server a public HTTPS URL with mcpwarp, then add it to ChatGPT as a custom connector.
---

**Once `mcpwarp up` prints a URL for your server, add it to ChatGPT as a custom connector and complete the OAuth sign-in when prompted.**

Add a custom connector / remote MCP server in ChatGPT's settings and paste the URL from your `mcpwarp up` table. Complete the OAuth sign-in when prompted — this authorizes that ChatGPT account against that specific server.

Exact menu names move around as ChatGPT's UI changes; look for "connectors," "custom connectors," or "MCP servers" in settings.

## "Unsafe URL" with localhost

If you paste a `http://localhost` URL, ChatGPT shows an "Unsafe URL" error. ChatGPT calls your server from OpenAI's servers, which can't reach your machine. Use the public HTTPS URL from `mcpwarp up` instead.

MCP Warp isn't certified by OpenAI — it's built to work with ChatGPT as a standard Streamable HTTP MCP client.
