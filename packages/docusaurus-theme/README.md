# @netfoundry/docusaurus-theme

A drop-in Docusaurus theme for NetFoundry documentation sites. Provides a consistent layout, footer, star banner, and styling across all NetFoundry/OpenZiti documentation.

## Installation

```bash
npm install @netfoundry/docusaurus-theme
# or
yarn add @netfoundry/docusaurus-theme
```

## Usage

### 1. Register the theme

In your `docusaurus.config.ts`:

```typescript
export default {
  // ...
  themes: [
    '@netfoundry/docusaurus-theme',
  ],
  // ...
};
```

### 2. Configure the theme

Add NetFoundry-specific configuration to `themeConfig`:

```typescript
export default {
  // ...
  themeConfig: {
    netfoundry: {
      showStarBanner: true,
      starBanner: {
        repoUrl: 'https://github.com/openziti/ziti',
        label: 'Star OpenZiti on GitHub',
      },
      footer: {
        description: 'Your site description here.',
        socialProps: {
          githubUrl: 'https://github.com/your-org/',
          youtubeUrl: 'https://youtube.com/your-channel/',
          linkedInUrl: 'https://www.linkedin.com/company/your-company/',
          twitterUrl: 'https://twitter.com/your-handle/',
        },
      },
    },
    // ... other theme config
  },
};
```

## What's Included

### Automatic Layout
The theme automatically provides:
- **NetFoundry Layout** - Wraps all pages with consistent structure
- **Footer** - Configurable footer with social links and site sections
- **Star Banner** - Optional GitHub star call-to-action banner

### CSS Variables & Styling
All CSS is automatically loaded. No need to add `@import` statements to your `custom.css`.

Includes:
- NetFoundry brand colors and typography
- Light/dark mode support
- Responsive design tokens
- Code block styling

### Components

Import UI components directly:

```tsx
import { Alert, CodeBlock, OsTabs } from '@netfoundry/docusaurus-theme/ui';
```

### Remark Plugins

Import remark plugins for your docs config:

```typescript
import { remarkYouTube, remarkCodeSections } from '@netfoundry/docusaurus-theme/plugins';

export default {
  presets: [
    ['classic', {
      docs: {
        remarkPlugins: [remarkYouTube, remarkCodeSections],
      },
    }],
  ],
};
```

### Node Utilities

Import Node.js utilities:

```typescript
import { pluginHotjar, cleanUrl, docUrl } from '@netfoundry/docusaurus-theme/node';
```

## Package Exports

| Export | Description |
|--------|-------------|
| `@netfoundry/docusaurus-theme` | Theme entry point (for `themes` array) |
| `@netfoundry/docusaurus-theme/ui` | React components |
| `@netfoundry/docusaurus-theme/plugins` | Remark plugins |
| `@netfoundry/docusaurus-theme/node` | Node.js utilities |
| `@netfoundry/docusaurus-theme/css/*` | Individual CSS files |

## Customization

### Swizzling Components

To customize the layout beyond configuration:

```bash
npx docusaurus swizzle @netfoundry/docusaurus-theme Layout --wrap
```

### Custom CSS

Add your own CSS after the theme styles by creating `src/css/custom.css`:

```css
/* Your custom overrides */
:root {
  --ifm-color-primary: #your-color;
}
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) at the repository root for development setup, workflow, and examples.

## License

Apache-2.0
