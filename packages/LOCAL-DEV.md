# Local Development Guide

How to develop and test the theme locally before publishing to npm.

## Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   test-site/    │     │  file: protocol  │     │    npm install  │
│  (yarn link)    │ --> │  (simulates npm) │ --> │   (production)  │
│  needs watch    │     │   needs build    │     │   needs publish │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Project layout

```
packages/
├── docusaurus-theme/         # @netfoundry/docusaurus-theme npm package
│   ├── src/                  # TypeScript source → compiled to dist/
│   ├── css/                  # Stylesheets (served directly, not compiled)
│   └── theme/                # Docusaurus theme component overrides
└── test-site/                # Aggregator test site (mirrors unified-doc)
    ├── remotes/              # Fake sub-projects (like unified-doc/_remotes)
    │   ├── zrok/website/
    │   ├── openziti/docusaurus/
    │   ├── frontdoor/docusaurus/
    │   ├── onprem/docusaurus/
    │   └── zlan/docusaurus/
    ├── docs/                 # Main docs (classic preset)
    └── docusaurus.config.ts  # Aggregates all sub-projects
```

The test-site mirrors the unified-doc architecture: one Docusaurus site aggregating
multiple standalone sub-projects via `plugin-content-docs` instances. Each sub-project
lives in `remotes/` with its own `docusaurus.config.ts` (for standalone use) and a
`docusaurus-plugin-*-docs.ts` (for aggregation).

## Step 1: One-time local link setup

The test-site uses `yarn link` so it always resolves `@netfoundry/docusaurus-theme`
directly from your local `packages/docusaurus-theme` directory. Run these once after
cloning:

```bash
# Register the theme as a linkable package
yarn --cwd packages/docusaurus-theme link

# Point the test-site at the local copy
yarn --cwd packages/test-site link "@netfoundry/docusaurus-theme"
```

After this, `packages/test-site/node_modules/@netfoundry/docusaurus-theme` is a symlink
to `packages/docusaurus-theme`. Rebuilding the theme is immediately visible to the dev
server — no reinstall needed.

## Step 2: Develop with test-site

Start the dev server:

```bash
cd packages/test-site
yarn start
```

### What needs a rebuild

| What you changed | What to do |
|---|---|
| `src/` components (React/TS) | Nothing extra — `yarn watch` recompiles automatically |
| `theme/` component overrides | Nothing extra — `yarn watch` recompiles automatically |
| `css/` stylesheets | Nothing extra — `yarn watch` copies CSS automatically |

### Watching theme changes during development

`yarn watch` runs `tsc --watch` and a CSS file watcher together. Run it in a second
terminal:

```bash
# Terminal 1 — theme watcher (TS + CSS)
cd packages/docusaurus-theme
yarn watch

# Terminal 2 — test site dev server
cd packages/test-site
yarn start
```

On every save, changes compile in ~1 second and Docusaurus hot-reloads the result.

## Step 3: Build the theme

Before testing with remote sites or publishing:

```bash
cd packages/docusaurus-theme
yarn build
```

This compiles TypeScript to CommonJS in `dist/`.

## Step 4: Test with remote site (file: protocol)

This simulates exactly what npm publish will deliver.

### 4a. Update the remote's package.json

```json
{
  "dependencies": {
    "@netfoundry/docusaurus-theme": "file:../../../../packages/docusaurus-theme"
  }
}
```

Adjust the path based on your remote's location relative to the theme package.

### 4b. Install and test

```bash
cd unified-doc/_remotes/frontdoor/docusaurus
yarn install
yarn build   # production build
# or
yarn start   # dev server
```

### 4c. Iterating on changes

After making theme changes:

```bash
# 1. Rebuild theme
cd packages/docusaurus-theme
yarn build

# 2. Reinstall in remote (force to pick up changes)
cd unified-doc/_remotes/frontdoor/docusaurus
yarn install --force

# 3. Clear cache if you see stale behavior
rm -rf .docusaurus node_modules/.cache

# 4. Test
yarn build
```

## Step 5: Publish to npm

Once satisfied with local testing:

```bash
cd packages/docusaurus-theme
yarn build
yarn test
npm version patch   # or minor/major
npm publish
```

## Step 6: Verify from npm

Change the remote's package.json back to a version number:

```json
{
  "dependencies": {
    "@netfoundry/docusaurus-theme": "^0.2.3"
  }
}
```

Then:

```bash
cd unified-doc/_remotes/frontdoor/docusaurus
rm -rf node_modules/@netfoundry
yarn install
yarn build
```

## Quick reference

| Stage | Theme build? | Command |
|-------|-------------|---------|
| One-time link setup | No | see Step 1 |
| Dev with test-site (any change) | Yes (watch) | `yarn watch` in `packages/docusaurus-theme` |
| Test with file: | Yes | `yarn build` then remote `yarn install --force` |
| Publish | Yes | `npm version patch && npm publish` |
| Verify from npm | N/A | remote `yarn install && yarn build` |

## Test-site sub-project structure

Each sub-project in `remotes/` follows the same pattern as the real repos:

```
remotes/zrok/website/
├── docusaurus.config.ts                  # Standalone config (references local theme)
├── docusaurus-plugin-zrok-docs.ts        # Plugin config for aggregation
├── sidebars.ts
├── static/
└── docs/
    └── *.mdx
```

The aggregator config (`test-site/docusaurus.config.ts`) imports each plugin:

```typescript
import {zrokDocsPluginConfig} from "./remotes/zrok/website/docusaurus-plugin-zrok-docs";

// ...
plugins: [
    zrokDocsPluginConfig(zrokRoot, REMARK_MAPPINGS, 'docs/zrok'),
]
```

All sub-projects route under `/docs/$projectname`.

## Troubleshooting

### "Cannot find module" errors

```bash
# Clear Docusaurus and webpack caches
rm -rf .docusaurus node_modules/.cache
```

### Changes not reflecting

```bash
# Ensure theme is rebuilt
cd packages/docusaurus-theme && yarn build

# Force reinstall in remote
cd <remote> && yarn install --force
```

### CSS not loading / "Unexpected token" in CSS

You're importing from `/ui` in a config file. Use `/config` instead:

```typescript
// Wrong - has CSS, fails at config load time
import { foo } from "@netfoundry/docusaurus-theme/ui";

// Right - no CSS, safe for config files
import { foo } from "@netfoundry/docusaurus-theme/config";
```

### JSX parse errors in config

Config files are loaded by jiti which can't parse JSX. Use `.ts` not `.tsx` for files
imported by `docusaurus.config.ts`, and use plain objects instead of JSX:

```typescript
// Wrong
documentationLinks: [<a href="/docs">Docs</a>]

// Right
documentationLinks: [{ href: '/docs', label: 'Docs' }]
```
