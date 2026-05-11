# NetFoundry Docusaurus Shared

Shared documentation theme, components, and tooling for NetFoundry's Docusaurus-based documentation sites.

## Repository Structure

```
docusaurus-shared/
├── packages/
│   ├── docusaurus-theme/     # @netfoundry/docusaurus-theme npm package
│   └── test-site/            # Local dev sandbox for the theme
├── unified-doc/              # Unified production documentation build
├── docs-linter/              # Vale + markdownlint tooling
└── bootstrap.sh              # New site bootstrapper
```

See [`packages/test-site/README.md`](./packages/test-site/README.md) for the
test-site dev loop, docs organization, and debug recipes.

## Quick Start

### Using the Theme

Install the theme in your Docusaurus project:

```bash
yarn add @netfoundry/docusaurus-theme
```

Add to your `docusaurus.config.ts`:

```typescript
export default {
  themes: ['@netfoundry/docusaurus-theme'],
  themeConfig: {
    netfoundry: {
      showStarBanner: true,
      starBanner: {
        repoUrl: 'https://github.com/openziti/ziti',
        label: 'Star OpenZiti on GitHub',
      },
      footer: {
        description: 'Your site description.',
        socialProps: {
          githubUrl: 'https://github.com/your-org/',
        },
      },
    },
  },
};
```

See the [theme README](./packages/docusaurus-theme/README.md) for full documentation.

### Creating a New Doc Site

```bash
./bootstrap.sh /path/to/new-site [starLabel] [starRepoUrl]
```

## Prerequisites

- Node.js 18+
- Yarn (`npm install -g yarn`)

## Development

```bash
git clone https://github.com/netfoundry/docusaurus-shared.git
cd docusaurus-shared
yarn install
```

All routine commands run from the repo root. No `cd` into subfolders required:

| Command                  | What it does                                              |
|--------------------------|-----------------------------------------------------------|
| `yarn test-site`         | Start the test-site dev sandbox (alias: `yarn dev`)       |
| `yarn test-site:build`   | Production build of the test-site (alias: `yarn build`)   |
| `yarn theme:build`       | Build `@netfoundry/docusaurus-theme`                      |
| `yarn theme:watch`       | Watch the theme for incremental rebuilds                  |
| `yarn unified`           | Start the unified-doc dev server                          |
| `yarn unified:build`     | Production build of unified-doc                           |
| `yarn test`              | Run theme unit tests                                      |
| `yarn reinstall`         | Wipe every node_modules + lockfile, install fresh         |

See [packages/test-site/README.md](./packages/test-site/README.md) for the full
dev-loop walkthrough, debug recipes, and what hot-reloads vs. what needs a
rebuild.

## Local Development

See [packages/LOCAL-DEV.md](./packages/LOCAL-DEV.md) for the full local development guide, including how to use the test-site, test with remote sites via `file:` protocol, and publish.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, workflow, and a walkthrough example of making theme changes.

## Best Practices

### Relative Linking

Use relative paths for internal links:

```markdown
<!-- Do this -->
Here [is a link](../to/some/path.md)

<!-- Not this -->
Here [is a link](@site/to/some/path)
Here [is a link](/docs/to/some/path.md)
```

### Images

Add images to the static folder scoped to your site:

```
/your-doc-site/static/img/your-doc-site/
```

Not directly in `/static/img/` (reserved for shared images).

### Partials

Use partials (files starting with `_`) sparingly:

```markdown
import SharedContent from '../_shared.content.md'

<SharedContent />
```

## Kinsta Hosting

The docusaurus site is hosted on Kinsta. Required nginx rule:

```
location /docs/ {
  try_files $uri $uri/ $uri/index.html /docs/index.html;
}
```

## License

Apache-2.0
