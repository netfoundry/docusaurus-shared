# NetFoundry Docusaurus Shared

Shared documentation theme, components, and tooling for NetFoundry's Docusaurus-based documentation sites.

## Repository Structure

```
docusaurus-shared/
├── packages/
│   └── docusaurus-theme/     # @netfoundry/docusaurus-theme npm package
├── test-site/                # Local development/testing site
├── unified-doc/              # Unified documentation build system
├── docs-linter/              # Vale + markdownlint tooling
└── bootstrap.sh              # New site bootstrapper
```

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

# Start development server
yarn dev

# Run tests
yarn test

# Build
yarn build
```

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
