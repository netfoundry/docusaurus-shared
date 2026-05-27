---
title: Configuration reference
sidebar_label: Configuration
---

# Configuration reference

NetFoundry LLM Gateway is configured with a YAML file. CLI flags can override individual settings.

## Running the gateway

Pass the config file path as the first argument:

```bash
llm-gateway run config.yaml
```

Override settings with flags:

```bash
llm-gateway run config.yaml --address 0.0.0.0:9000
```

## Configuration sections

### Gateway settings

Controls the listen address and optional zrok share for the gateway process:

```yaml
gateway:
  address: localhost:8080   # address to listen on (default: localhost:8080)
  zrok_share_token: ""      # optional zrok share token for overlay network access
```

### Providers

Configure which inference providers the gateway can route to:

```yaml
openai:
  api_key: ${OPENAI_API_KEY}    # supports environment variable expansion

anthropic:
  api_key: ${ANTHROPIC_API_KEY}

local:
  base_url: http://localhost:11434
```

### Virtual API keys

Restrict client access with named keys and per-key model permissions:

```yaml
api_keys:
  enabled: true
  keys:
    - name: alice
      key: ${ALICE_KEY}
      allowed_models: ["gpt-*", "claude-*"]
    - name: bob
      key: ${BOB_KEY}
      allowed_models: ["llama*"]
```

See [Virtual API keys](api-keys.md) for a full reference.

### Routing

Enable semantic routing and define named routes:

```yaml
routing:
  default_route: general
  semantic:
    enabled: true
    provider: local
    model: nomic-embed-text
    threshold: 0.75
    ambiguous_threshold: 0.5
  routes:
    - name: coding
      model: claude-haiku-4-5-20251001
      description: "code generation, debugging, and technical tasks"
      examples:
        - "write a python function to sort a list"
```

See [Semantic routing](semantic-routing.md) for a full reference.

### Metrics

Expose a Prometheus metrics endpoint:

```yaml
metrics:
  enabled: true
```

### Tracing

Enable request body logging for debugging routing decisions:

```yaml
tracing:
  enabled: true
  max_content_length: 200   # max characters per message in log output
```

When enabled, each chat completion request is logged with the model, message count, streaming flag,
tool count, and each message's role and truncated content.

## Environment variables

String values support `${VAR_NAME}` expansion. Variables are expanded at startup:

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
llm-gateway run config.yaml
```

## CLI flags

```
llm-gateway run <config-path> [flags]

Flags:
  --address string          Gateway listen address (e.g., 0.0.0.0:8080)
  --zrok-share-token string Zrok share token for overlay network access
  --metrics-address string  Prometheus metrics listen address
  -h, --help               Show help
```

CLI flags take precedence over the config file.

## Startup sequence

When the gateway starts, it:

1. Loads the YAML config file.
2. Applies any CLI flag overrides.
3. Expands environment variables.
4. Initializes providers and the router.
5. Starts the HTTP server.

On shutdown (SIGINT/SIGTERM), the gateway drains in-flight requests, closes connections,
and cleans up any zrok shares before exiting.

## Complete example

A full configuration combining all sections:

```yaml
gateway:
  address: 0.0.0.0:8080
  zrok_share_token: ${ZROK_SHARE_TOKEN}

api_keys:
  enabled: true
  keys:
    - name: primary
      key: ${PRIMARY_API_KEY}
      allowed_models: ["gpt-*", "claude-*", "llama*"]

openai:
  api_key: ${OPENAI_API_KEY}

anthropic:
  api_key: ${ANTHROPIC_API_KEY}

local:
  base_url: http://localhost:11434

routing:
  default_route: general
  semantic:
    enabled: true
    provider: local
    model: nomic-embed-text
    threshold: 0.75

metrics:
  enabled: true
```
