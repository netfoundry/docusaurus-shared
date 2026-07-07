---
sidebar_label: "Go"
---

# Theme test: Go

```go
// Package overlay dials a Ziti service and echoes a request over it.
package overlay

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/openziti/sdk-golang/ziti"
)

const (
	defaultTimeout = 5 * time.Second
	maxRetries     = 3
)

// ErrNoService is returned when the named service cannot be reached.
var ErrNoService = errors.New("overlay: service unavailable")

// Client wraps a Ziti context and a small retry policy.
type Client struct {
	ctx     ziti.Context
	service string
	retries int
}

// Dialer is anything that can open a connection by service name.
type Dialer interface {
	Dial(service string) (context.Context, error)
}

// NewClient builds a Client, defaulting retries when unset.
func NewClient(ctx ziti.Context, service string, opts ...func(*Client)) *Client {
	c := &Client{ctx: ctx, service: service, retries: maxRetries}
	for _, opt := range opts {
		opt(c)
	}
	return c
}

func (c *Client) Fetch(ctx context.Context) (n int, err error) {
	for attempt := 1; attempt <= c.retries; attempt++ {
		conn, dialErr := c.ctx.Dial(c.service)
		if dialErr != nil {
			err = fmt.Errorf("attempt %d: %w", attempt, ErrNoService)
			time.Sleep(time.Duration(attempt) * 250 * time.Millisecond)
			continue
		}
		defer conn.Close()
		return conn.Write([]byte("GET /health\r\n"))
	}
	return 0, err
}
```
