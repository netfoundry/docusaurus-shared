---
sidebar_label: "Config (YAML / JSON / Docker)"
---

# Theme test: config formats

## YAML

```yaml
# controller web listener with the console bound
web:
  - name: client-management
    bindPoints:
      - interface: 0.0.0.0:1280
        address: quickstart.demo.openziti.io:1280
    options:
      idleTimeout: 5000ms
      minTLSVersion: TLS1.2
    apis:
      - binding: edge-management
      - binding: spa
        options:
          location: ./console
          indexFile: index.html
          enabled: true      # serve the admin console at /zac/
```

## JSON

```json
{
  "protocols": ["tcp"],
  "addresses": ["first-service.ziti"],
  "portRanges": [{ "low": 1280, "high": 1280 }],
  "encryptionRequired": true,
  "tags": {
    "owner": "get-started",
    "createdAt": "2026-07-06T00:00:00Z",
    "retries": 3,
    "ephemeral": false
  }
}
```

## Dockerfile

```dockerfile
FROM golang:1.26 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/ziti ./cmd/ziti

FROM gcr.io/distroless/static:nonroot
COPY --from=build /out/ziti /usr/local/bin/ziti
EXPOSE 1280 3022
ENTRYPOINT ["ziti", "run", "quickstart", "--zac"]
```
