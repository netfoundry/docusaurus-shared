---
title: Use persistent shares
sidebar_label: Persistent shares
---

# Use persistent shares

By default, share tokens are ephemeral — they disappear when the process exits. For production use,
create persistent shares that survive restarts and keep a stable token.

## Create a persistent share

Run this once to reserve a named share:

```bash
zrok2 create share my-gateway
```

Share names must be 3–32 characters, lowercase alphanumeric and hyphens (`[a-z0-9-]`). If you omit
the name, zrok generates a random token.

## Use with mcp-gateway

Set the `share_token` at the top level of your config:

```yaml
share_token: "my-gateway"

aggregator:
  name: "my-dev-tools"
  version: "1.0.0"
```

## Use with mcp-bridge

Pass the token with the `--share-token` flag:

```bash
mcp-bridge --share-token my-bridge mcp-filesystem ~/Documents
```

## Delete when done

```bash
zrok2 delete share my-gateway
```
