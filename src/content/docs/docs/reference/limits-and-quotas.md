---
title: Limits and quotas
description: Plan tiers, what counts as a request, when the counter resets, and what happens over quota.
---

**Everyone is on Free during the private alpha: 100 requests/month, 1 server. Plus and Pro are planned but not purchasable yet.**

## Plans

| Plan | Price | Requests | Servers |
| --- | --- | --- | --- |
| Free | $0 | 100/month | 1 |
| Plus | $5/month (coming later) | Unlimited | 1 |
| Pro | $10/month (coming later) | Unlimited | Unlimited (fair use) |

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

Plus and Pro aren't purchasable yet — email [support@mcpwarp.io](mailto:support@mcpwarp.io) to request early access.

## Downgrading

Downgrading below your current server count doesn't delete servers — it only blocks creating new ones until you're back within your plan's limit.

See [Pricing](/pricing/) for plan details.
