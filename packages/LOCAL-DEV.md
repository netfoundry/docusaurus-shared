# Local Development Guide

How to develop and test the theme locally before publishing to npm.

## Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   test-site/    │     │  file: protocol  │     │    npm install  │
│  (local path)   │ --> │  (simulates npm) │ --> │   (production)  │
│   instant HMR   │     │   needs build    │     │   needs publish │
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

## Step 1: Develop with test-site

The test-site references the theme via local path. Start the dev server:

```bash
cd packages/test-site
yarn start
```

### What needs a rebuild

| What you changed | What to do |
|---|---|
| `src/` components (React/TS) | Nothing — webpack HMR picks them up instantly |
| `theme/` component overrides | Rebuild needed — see watch mode below |
| `css/` stylesheets | Rebuild needed — see below |

### Watching `theme/` changes during development

`theme/` overrides (e.g. swizzled Docusaurus components) are compiled to `dist/theme/`
and served from there. Run the TypeScript compiler in watch mode in a second terminal
so changes are recompiled automatically:

```bash
# Terminal 1 — theme watcher
cd packages/docusaurus-theme
yarn watch

# Terminal 2 — test site dev server
cd packages/test-site
yarn start
```

On every save in `theme/`, `tsc --watch` recompiles in ~1 second and Docusaurus
hot-reloads the result.

### CSS changes

Theme CSS files (`packages/docusaurus-theme/css/`) are not watched automatically.
After editing CSS run a full build:

```bash
cd packages/docusaurus-theme
yarn build
```

The dev server will pick up the rebuilt CSS on next page load.

## Step 2: Build the theme

Before testing with remote sites or publishing:

```bash
cd packages/docusaurus-theme
yarn build
```

This compiles TypeScript to CommonJS in `dist/`.

## Step 3: Test with remote site (file: protocol)

This simulates exactly what npm publish will deliver.

### 3a. Update the remote's package.json

```json
{
  "dependencies": {
    "@netfoundry/docusaurus-theme": "file:../../../../packages/docusaurus-theme"
  }
}
```

Adjust the path based on your remote's location relative to the theme package.

### 3b. Install and test

```bash
cd unified-doc/_remotes/frontdoor/docusaurus
yarn install
yarn build   # production build
# or
yarn start   # dev server
```

### 3c. Iterating on changes

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

## Step 4: Publish to npm

Once satisfied with local testing:

```bash
cd packages/docusaurus-theme
yarn build
yarn test
npm version patch   # or minor/major
npm publish
```

## Step 5: Verify from npm

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
| Dev with test-site (`src/` components) | No | `cd packages/test-site && yarn start` |
| Dev with test-site (`theme/` overrides) | Watch mode | `cd packages/docusaurus-theme && yarn watch` |
| Dev with test-site (CSS) | Yes | `cd packages/docusaurus-theme && yarn build` |
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
# Clear all caches
rm -rf .docusaurus node_modules/.cache
yarn install --force
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
