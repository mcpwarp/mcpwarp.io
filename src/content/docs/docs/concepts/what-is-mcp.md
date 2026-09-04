---
title: What is MCP
description: A quick primer on the Model Context Protocol, for context on what MCP Warp exposes.
---

**MCP (Model Context Protocol) is a standard way for LLM clients — Claude, ChatGPT, Cursor, VS Code — to talk to tools and data sources, called MCP servers.**

An MCP server exposes tools, resources, and prompts over a defined protocol. A client connects to a server, discovers what it can do, and calls it on the model's behalf — reading a file, querying an API, controlling an app.

MCP servers can run locally (as a spawned process talking over stdin/stdout — "stdio") or as a network service (talking HTTP — "Streamable HTTP", the current transport generation). Either way, a server only does anything for a client that's actually connected to it.

That's the gap MCP Warp fills: it takes an MCP server running on your machine — stdio or HTTP — and gives it a public, OAuth-protected URL so remote clients can connect to it as if it were already a hosted service.
