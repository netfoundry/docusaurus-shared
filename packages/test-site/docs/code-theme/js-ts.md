---
sidebar_label: "TypeScript"
---

# Theme test: TypeScript

```typescript
import { connect, type Connection } from '@openziti/ziti-sdk-nodejs';

/** Roles that may dial the demo service. */
type Role = `#${string}` | '@all';

interface ServiceSpec {
  readonly name: string;
  readonly intercept: string;
  readonly port: number;
  readonly roles: Role[];
}

const DEFAULT_PORT = 1280 as const;
const BACKOFF_MS = [250, 500, 1_000];

const spec: ServiceSpec = {
  name: 'first-service',
  intercept: 'first-service.ziti',
  port: DEFAULT_PORT,
  roles: ['#first-service-clients'],
};

async function fetchWithRetry(
  svc: ServiceSpec,
  retries = 3,
): Promise<Record<string, string | number>> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn: Connection = await connect(svc.name);
      const body = await conn.request(`https://${svc.intercept}:${svc.port}/version`);
      return { service: svc.name, status: 200, body };
    } catch (err) {
      const wait = BACKOFF_MS[attempt - 1] ?? 1_000;
      console.warn(`attempt ${attempt} failed: ${(err as Error).message}, waiting ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error(`${svc.name} unreachable after ${retries} attempts`);
}

fetchWithRetry(spec).then((res) => console.log(JSON.stringify(res, null, 2)));
```
