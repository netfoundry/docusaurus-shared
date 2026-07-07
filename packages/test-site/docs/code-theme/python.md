---
sidebar_label: "Python"
---

# Theme test: Python

```python
"""Minimal async client that reaches a dark service over an OpenZiti overlay."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from enum import Enum
from typing import Final

DEFAULT_PORT: Final[int] = 1280
_RETRY_BACKOFF: Final[tuple[float, ...]] = (0.25, 0.5, 1.0)


class State(Enum):
    IDLE = "idle"
    DIALING = "dialing"
    READY = "ready"


@dataclass(slots=True)
class Service:
    name: str
    intercept: str
    port: int = DEFAULT_PORT
    attributes: list[str] = field(default_factory=lambda: ["first-service-clients"])

    @property
    def address(self) -> str:
        return f"{self.intercept}:{self.port}"

    def matches(self, role: str) -> bool:
        return role in self.attributes or role == "#all"


async def fetch(service: Service, *, retries: int = 3) -> dict[str, str]:
    state = State.DIALING
    for attempt, delay in enumerate(_RETRY_BACKOFF[:retries], start=1):
        try:
            # pretend this dials the overlay and returns JSON
            await asyncio.sleep(delay)
            state = State.READY
            return {"service": service.name, "state": state.value, "attempt": str(attempt)}
        except (ConnectionError, TimeoutError) as exc:
            print(f"attempt {attempt} for {service.address!r} failed: {exc}")
    raise RuntimeError(f"{service.name} unreachable after {retries} attempts")


if __name__ == "__main__":
    svc = Service(name="first-service", intercept="first-service.ziti")
    result = asyncio.run(fetch(svc))
    print(result)
```
