---
sidebar_label: "Java & C#"
---

# Theme test: Java and C\#

## Java

```java
package io.openziti.demo;

import java.time.Duration;
import java.util.List;
import java.util.Objects;

/** Reaches a dark service over an OpenZiti overlay. */
public final class OverlayClient {
    private static final int DEFAULT_PORT = 1280;
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final String service;
    private final List<String> roles;

    public OverlayClient(String service, List<String> roles) {
        this.service = Objects.requireNonNull(service, "service");
        this.roles = List.copyOf(roles);
    }

    public boolean authorized(String role) {
        return roles.contains(role) || "#all".equals(role);
    }

    public String fetch(int retries) throws InterruptedException {
        for (int attempt = 1; attempt <= retries; attempt++) {
            try {
                return "200 OK from " + service + " on :" + DEFAULT_PORT;
            } catch (RuntimeException ex) {
                System.err.printf("attempt %d failed: %s%n", attempt, ex.getMessage());
                Thread.sleep(TIMEOUT.toMillis() / retries);
            }
        }
        throw new IllegalStateException("unreachable: " + service);
    }
}
```

## C\#

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenZiti.Demo;

/// <summary>Reaches a dark service over an OpenZiti overlay.</summary>
public sealed record OverlayClient(string Service, IReadOnlyList<string> Roles)
{
    private const int DefaultPort = 1280;

    public bool Authorized(string role) =>
        Roles.Contains(role) || role is "#all";

    public async Task<string> FetchAsync(int retries = 3)
    {
        for (var attempt = 1; attempt <= retries; attempt++)
        {
            try
            {
                await Task.Delay(TimeSpan.FromMilliseconds(250 * attempt));
                return $"200 OK from {Service} on :{DefaultPort}";
            }
            catch (Exception ex) when (attempt < retries)
            {
                Console.Error.WriteLine($"attempt {attempt} failed: {ex.Message}");
            }
        }
        throw new InvalidOperationException($"unreachable: {Service}");
    }
}
```
