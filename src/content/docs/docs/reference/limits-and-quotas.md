---
title: Limits and quotas
description: Plan tiers, what counts as a request, when the counter resets, and what happens over quota.
---

**Three plans are available: Free (100 requests/month, 1 server), Plus ($5/month, unlimited requests), and Pro ($10/month, unlimited requests and servers).**

## Plans

| Plan | Price | Requests | Servers |
| --- | --- | --- | --- |
| Free | $0 | 100/month | 1 |
| Plus | $5/month | Unlimited | 1 |
| Pro | $10/month | Unlimited | Unlimited (fair use) |

## What counts as a request

One HTTP request an MCP client makes to your public URL counts as one request against your quota.

## Reset

The usage counter resets at the start of each UTC month.

## Over quota

Quota is enforced as a hard block: once you're over, requests get `429` with a JSON body:

```json
{ "error": "quota_exceeded", "message": "..." }
```

The CLI surfaces this as:

```
QUOTA_EXCEEDED ... Upgrade your plan at web.mcpwarp.io/settings
```

Upgrade from Settings > Billing in the dashboard. See [Manage your subscription](/docs/how-to/billing/).

## Downgrading

Downgrading below your current server count doesn't delete servers — it only blocks creating new ones until you're back within your plan's limit. On Free, the 100-requests-per-month cap applies starting from your next request. See [Manage your subscription](/docs/how-to/billing/).

See [Pricing](/pricing/) for plan details.
