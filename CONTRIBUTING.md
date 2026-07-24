# Contributing to docusaurus-shared

This guide covers the development workflow for making changes to the NetFoundry Docusaurus theme and shared components.

## Repository structure

```text
docusaurus-shared/
├── packages/
│   └── docusaurus-theme/     # @netfoundry/docusaurus-theme
│       ├── src/
│       │   ├── index.ts          # Theme entry point
│       │   ├── ui.ts             # UI components entry
│       │   ├── plugins.ts        # Remark plugins entry
│       │   ├── node.ts           # Node utilities entry
│       │   ├── components/       # React components
│       │   └── docusaurus-plugins/
│       ├── theme/
│       │   └── Layout/           # Docusaurus Layout override
│       ├── css/
│       │   ├── theme.css         # Main CSS (imports others)
│       │   ├── vars.css          # Light mode variables
│       │   ├── vars-dark.css     # Dark mode variables
│       │   └── legacy.css        # Comprehensive styling
│       └── __tests__/
│
│   └── test-site/            # Local dev sandbox for the theme
│       ├── docusaurus.config.ts
│       ├── docs/             # See packages/test-site/README.md
│       └── src/
│
├── unified-doc/              # Unified documentation build system
├── docs-linter/              # Vale + markdownlint tooling
├── bootstrap.sh              # New site bootstrapper
├── package.json              # Workspace root
└── CONTRIBUTING.md           # You are here
```

## The theme package

| Package | npm | Purpose |
|---------|-----|---------|
| `@netfoundry/docusaurus-theme` | [npm](https://www.npmjs.com/package/@netfoundry/docusaurus-theme) | Drop-in Docusaurus theme with layout, footer, components, and styling. |

---

## Development workflow

### Prerequisites

- Node.js 18+
- Yarn package manager

### Initial setup

```bash
git clone https://github.com/netfoundry/docusaurus-shared.git
cd docusaurus-shared
yarn install
```

### Quick commands (from repo root)

```bash
yarn dev      # Start test-site dev server
yarn build    # Build test-site
yarn test     # Run theme tests
```

---

## Making changes to the theme

### 1. Configure local development

The test-site is pre-configured to use the local theme. Check `test-site/docusaurus.config.ts`:

```typescript
import path from "node:path";

export default {
    themes: [
        // Use local path for development; in production would be '@netfoundry/docusaurus-theme'
        path.resolve(__dirname, '../packages/docusaurus-theme'),
        // Remote reference to test the deployed package
        // '@netfoundry/docusaurus-theme'
    ],
    // ...
};
```

### 2. Start development server

```bash
yarn dev
# or
cd test-site && yarn start
```

Open http://localhost:3000. Changes to theme files hot-reload automatically.

### 3. Make your changes

Common file locations:

| Change Type | File Location |
|-------------|---------------|
| CSS variables (colors, spacing) | `packages/docusaurus-theme/css/legacy.css` |
| Light mode variables | `packages/docusaurus-theme/css/vars.css` |
| Dark mode variables | `packages/docusaurus-theme/css/vars-dark.css` |
| Layout wrapper | `packages/docusaurus-theme/theme/Layout/index.tsx` |
| Footer component | `packages/docusaurus-theme/src/components/NetFoundryFooter/` |
| Star banner | `packages/docusaurus-theme/src/components/StarUs/` |
| Other components | `packages/docusaurus-theme/src/components/` |
| Remark plugins | `packages/docusaurus-theme/src/docusaurus-plugins/` |
| Theme config types | `packages/docusaurus-theme/src/options.ts` |

### 4. Test your changes

```bash
# Development server (hot reload)
yarn dev

# Production build (catches more issues)
yarn build
cd test-site && yarn serve
```

### 5. Run tests

```bash
yarn test
# or
cd packages/docusaurus-theme && yarn test
```

### 6. Publish

```bash
cd packages/docusaurus-theme

# Bump version
npm version patch   # 0.1.2 → 0.1.3

# Publish (tests run automatically)
npm publish
```

### 7. Verify published package

Update `test-site/package.json`:

```json
"@netfoundry/docusaurus-theme": "^0.1.3"
```

Switch `test-site/docusaurus.config.ts` to use package name:

```typescript
themes: [
    '@netfoundry/docusaurus-theme',
],
```

Then:

```bash
cd test-site
yarn install
yarn build
```

---

## Example: Changing a CSS variable

Here's a complete walkthrough of changing the light-mode tab color.

### The problem

The tab highlight color (`--nf-tab-color`) is pink in light mode. We want grey instead.

### Step 1: Find the variable

```bash
grep -n "nf-tab-color" packages/docusaurus-theme/css/legacy.css
```

Output:

```text
89:    --nf-tab-color: 255, 182, 193;
90:    --nf-tab-color-render: rgb(255, 182, 193);
143:    --nf-tab-color: 67, 72, 98;
```

- Line 89-90: Light mode (`:root`)
- Line 143: Dark mode (`html[data-theme="dark"]`)

### Step 2: Start dev server

```bash
yarn dev
```

### Step 3: Make the change

Edit `packages/docusaurus-theme/css/legacy.css` around line 89:

```css
/* Before */
:root {
    --nf-tab-color: 255, 182, 193;
    --nf-tab-color-render: rgb(255, 182, 193);
}

/* After */
:root {
    --nf-tab-color: 222, 222, 222;
    --nf-tab-color-render: rgb(222, 222, 222);
}
```

Save. Browser hot-reloads with new color.

### Step 4: Test dark mode

Toggle dark mode in browser. Dark mode uses a different value (line 143) - verify it still looks correct.

### Step 5: Run tests & build

```bash
yarn test
yarn build
```

### Step 6: Publish

```bash
cd packages/docusaurus-theme
npm version patch
npm publish
```

### Step 7: Final verification

Update `test-site/package.json` to new version, switch config to package name, reinstall, rebuild.

---

## CSS variable reference

Key variables in `packages/docusaurus-theme/css/legacy.css`:

| Variable | Purpose | Light Mode | Dark Mode |
|----------|---------|------------|-----------|
| `--nf-tab-color` | Tab background (RGB) | `222, 222, 222` | `67, 72, 98` |
| `--ifm-color-primary` | Primary brand color | `#158eed` | `#158eed` |
| `--ifm-background-color` | Page background | (browser default) | `#111827` |
| `--ifm-font-color-base` | Body text | (browser default) | `#94a3b8` |
| `--ziti-footer-background-color` | Footer background | `#121a36` | `#121a36` |
| `--ifm-background-surface-color` | Card/surface background | (browser default) | `#1f2937` |

---

## Testing checklist

Before publishing:

- [ ] `yarn test` passes
- [ ] `yarn build` succeeds
- [ ] Light mode looks correct
- [ ] Dark mode looks correct
- [ ] Footer renders properly
- [ ] Star banner shows when enabled
- [ ] No browser console errors
- [ ] Mobile responsive layout works

---

## Troubleshooting

### Changes not appearing?

```bash
cd test-site
yarn clear          # Clear Docusaurus cache
yarn start          # Restart dev server
```

Also verify `docusaurus.config.ts` uses local path, not package name.

### Module not found?

1.  Run `yarn install` from repo root
2.  Check the file exists at the path specified in `package.json` exports
3.  Restart dev server

### CSS not loading?

1.  Check `css/theme.css` imports the file you changed
2.  Verify `src/index.ts` `getClientModules()` includes `theme.css`
3.  Hard refresh browser (Ctrl+Shift+R)

### TypeScript errors in consuming project?

The theme ships source files. Fix errors in theme source, not consumers.

---

## Package entry points

The theme exposes multiple entry points:

```typescript
// Theme plugin (for docusaurus.config.ts themes array)
import theme from '@netfoundry/docusaurus-theme';

// React components
import { Alert, CodeBlock, OsTabs, NetFoundryLayout } from '@netfoundry/docusaurus-theme/ui';

// Remark plugins
import { remarkYouTube, remarkCodeSections } from '@netfoundry/docusaurus-theme/plugins';

// Node utilities
import { pluginHotjar, cleanUrl } from '@netfoundry/docusaurus-theme/node';

// CSS (usually not needed - auto-loaded by theme)
import '@netfoundry/docusaurus-theme/css/legacy.css';
```

---

## Questions?

Open an issue at https://github.com/netfoundry/docusaurus-shared/issues
