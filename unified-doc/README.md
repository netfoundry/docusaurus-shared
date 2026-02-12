# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```


### Kinsta Hosting

As of Sep 2025 - the technical docs have been published to the public folder on kinsta. 
A **CUSTOM** rule was added by tech support:
```
location /docs {
  try_files $uri /docs/index.html;
}
```

This rule is **mandatory** for SPA deep linking. The tech support people had to add it.

---

## Visual Regression Testing

The unified-doc site includes BackstopJS for visual regression testing against production. This helps catch unintended visual changes when updating the theme, components, or content.

### Overview

- Compares screenshots of local dev site vs production (`https://netfoundry.io/docs/`)
- Tests organized by product: `openziti`, `frontdoor`, `selfhosted`, `zrok`, `zlan`, `home`
- 3 viewports: desktop (1920x1080), tablet (768x1024), mobile (375x812)
- Generates HTML diff reports highlighting visual differences

### Quick Start

```bash
# Install dependencies (includes backstopjs)
yarn install

# Generate test scenarios from production sitemap
yarn vrt:generate        # All products
yarn vrt:generate:zlan   # Single product (faster for testing)

# Capture reference screenshots from production
yarn vrt:reference:zlan

# Start local dev server (in another terminal)
yarn start

# Run visual regression test
yarn vrt:test:zlan

# View the diff report
yarn vrt:report:zlan
```

### Available Commands

Each product has its own set of commands:

| Command | Description |
|---------|-------------|
| `vrt:generate` | Generate configs for all products from sitemap |
| `vrt:generate:<product>` | Generate config for single product |
| `vrt:reference:<product>` | Capture reference screenshots from production |
| `vrt:test:<product>` | Compare local site against reference |
| `vrt:approve:<product>` | Approve current test screenshots as new reference |
| `vrt:report:<product>` | Open HTML diff report in browser |

Products: `home`, `openziti`, `frontdoor`, `selfhosted`, `zrok`, `zlan`

### Workflow

1. **Generate scenarios** - Fetches sitemap from production and creates `backstop.<product>.json` configs
2. **Capture reference** - Screenshots production site as the baseline
3. **Run tests** - Screenshots local site and compares against reference
4. **Review report** - HTML report shows side-by-side diffs with highlighted changes
5. **Approve changes** - If changes are intentional, approve to update reference

### Configuration

Generated config files (`backstop.<product>.json`) include:

- **misMatchThreshold: 0.5%** - Tolerates minor rendering differences
- **ignoreAntialiasing: true** - Prevents false positives from font rendering
- **delay: 2000ms** - Waits for page load before screenshot

The `onReady.js` script automatically hides:
- Cookie consent banners
- Chat widgets
- Hotjar feedback widgets

### Filtering

The scenario generator excludes:
- Blog posts (`/blog/`)
- zrok versioned docs (only tests latest)
- Tag pages
- Pagination pages

### Files

```
unified-doc/
├── scripts/
│   └── generate-vrt-scenarios.mjs   # Sitemap parser & config generator
├── backstop_data/
│   ├── engine_scripts/puppet/
│   │   ├── onBefore.js              # Pre-navigation setup
│   │   └── onReady.js               # Post-load cleanup
│   ├── bitmaps_reference_*/         # Reference screenshots (gitignored)
│   ├── bitmaps_test_*/              # Test screenshots (gitignored)
│   └── html_report_*/               # Diff reports (gitignored)
└── backstop.<product>.json          # Generated configs (gitignored)
```

### Tips

- Start with a small product (`zlan`, `home`) to verify setup works
- Run `yarn build && yarn serve` for more accurate production comparison
- Increase `delay` in config if pages have slow-loading content
- Add URLs to exclude patterns in `generate-vrt-scenarios.mjs` if needed
