# test-site

The **dev sandbox** for `@netfoundry/docusaurus-theme`. Every page under `docs/`
exists to exercise some part of the shared theme so visual regressions are easy
to spot. If something looks broken here, it's broken everywhere downstream.

This is not a production site. It is not published anywhere. The only reason
it exists is to give a fast inner loop for theme/component/css changes.

## Quick start

All commands run from the **repo root** -- no `cd` needed.

```bash
# install once
yarn install

# build the theme (only needed once, or after editing TypeScript / theme/)
yarn theme:build

# start the test-site dev server
yarn test-site
```

Visit http://localhost:3000. The root `/` redirects to `/docs`, which is the
category-grid landing page.

### Root scripts cheat-sheet

| Command                  | What it does                                              |
|--------------------------|-----------------------------------------------------------|
| `yarn test-site`         | Start the test-site dev server (alias: `yarn dev`)        |
| `yarn test-site:build`   | Production build of the test-site                         |
| `yarn test-site:clear`   | Clear test-site Docusaurus cache                          |
| `yarn theme:build`       | Build `@netfoundry/docusaurus-theme`                      |
| `yarn theme:watch`       | Watch the theme for incremental rebuilds                  |
| `yarn theme:clean`       | Clear theme `dist/`                                       |
| `yarn unified`           | Start the unified-doc dev server                          |
| `yarn unified:build`     | Production build of unified-doc                           |
| `yarn unified:clear`     | Clear unified-doc Docusaurus cache                        |
| `yarn test`              | Run theme unit tests                                      |
| `yarn reinstall`         | Wipe every node_modules + lockfile and reinstall fresh    |

## How the dev loop works

The test-site consumes the theme via yarn workspaces -- its
`node_modules/@netfoundry/docusaurus-theme` is a symlink into
`packages/docusaurus-theme/`. Whether changes hot-reload depends on what kind
of file you edit:

| What you change                                | Hot-reload?     | Why                                                                                        |
|------------------------------------------------|-----------------|--------------------------------------------------------------------------------------------|
| `packages/docusaurus-theme/css/**.css`         | **Yes**         | The theme's `getClientModules()` resolves `'../../css/theme.css'` straight to source.       |
| `packages/test-site/src/custom/custom.css`     | **Yes**         | Test-site-local CSS; Docusaurus watches it directly.                                       |
| `packages/test-site/docs/**.mdx`               | **Yes**         | Docusaurus watches the docs folder.                                                        |
| `packages/docusaurus-theme/src/**/*.ts(x)`     | **No**          | TS source is built to `dist/src/*.js`; the test-site's webpack alias points at `dist/`.    |
| `packages/docusaurus-theme/src/**/*.module.css`| **No**          | CSS modules are imported by built JS; the copy lives under `dist/src/`.                    |
| `packages/docusaurus-theme/theme/**`           | **No** (mostly) | `getThemePath()` returns the source path, but consuming bundlers cache aggressively.       |

For the **No** rows: rebuild the theme, then restart (or hard-refresh) the
test-site:

```bash
yarn theme:build
```

If you'd rather not run that by hand each time, run the theme's watcher in a
second terminal:

```bash
# terminal 1: theme watcher (TS + per-component CSS)
yarn theme:watch

# terminal 2: test-site dev server
yarn test-site
```

The watcher recompiles in ~1s; Docusaurus picks up the new `dist/` and
hot-reloads automatically.

### Why the CSS shortcut works

The theme's plugin entry (`packages/docusaurus-theme/src/index.ts`) calls
`require.resolve('../../css/theme.css')`. At runtime that file is loaded as
`dist/src/index.js`, so `'../../css/theme.css'` lands at the package's
**source** `css/` folder rather than a built copy under `dist/css/`. That's
deliberate -- it means edits to `css/vars.css`, `css/layout.css`, etc. flow
into the dev server without any rebuild.

In a published install, both `dist/` and `css/` are at the package root (per
the `files` field in `package.json`), so `'../../css/theme.css'` still
resolves correctly.

## Docs organization

```
docs/
├── index.mdx                    landing page with card grid (slug: /)
├── _partials/                   underscore-prefixed; ignored by sidebar
│   └── _details_with_code.mdx
├── markdown/                    plain Markdown / MDX features
├── components/                  components shipped by the theme
├── media/                       images, diagrams, math, video, charts
├── reference/                   site-level behaviors and content imports
└── plugins/                     remark plugins and OpenAPI integration
```

Each folder has a `_category_.json` with `link.type: "generated-index"`, so
adding a new file in any folder automatically appears as a card on the
category landing page **and** in the sidebar. No `sidebars.ts` edit needed.

## Adding a new sample page

1. Pick the right folder (or add a new one with a fresh `_category_.json`).
2. Drop in a `.mdx` file. Frontmatter is optional; use `sidebar_position` if
   you want to influence ordering.
3. Save. The dev server picks it up.

For something that exists in the theme package but doesn't have a demo here,
the test-site is the right place for it -- not in any downstream site.

## Debug recipes

### "MDX compilation failed for file ... Could not parse expression with acorn"

MDX treats `{...}` as a JS expression. The most common offender is math
notation -- `\frac{a}{b}` looks like JS to the parser. If KaTeX isn't wired
into the docs plugin, wrap math in ```` ```latex ```` fences as source instead
of `$$ ... $$` math fences. See `docs/media/math.mdx`.

Curly braces in regular prose can be escaped with `\{` and `\}` or wrapped in
inline backticks.

### "I edited the CSS and nothing changed"

Two things to check:

1. You edited the right file. Shared rules belong in
   `packages/docusaurus-theme/css/`, **not** in `packages/test-site/src/custom/custom.css`.
   See [CSS conventions](../../CLAUDE.md#css-conventions) (or whichever file
   you have in front of you).
2. The dev server is actually watching it. The `getClientModules()` path
   trick (`'../../css/theme.css'`) means edits to `css/*.css` propagate
   without a theme rebuild. If they don't, restart the test-site server -- a
   stale Webpack cache is the usual culprit.

### "I edited a React component and nothing changed"

The component is in `packages/docusaurus-theme/src/components/`, which is
TypeScript. The test-site's webpack alias points at the built `dist/src/*.js`.
Either run `yarn theme:build`, or keep `yarn theme:watch` running in a second
terminal (see the dev-loop section above).

### Math page broke the build

The math fences inside MDX cause Acorn to bail when KaTeX isn't enabled. The
page is intentionally written to use `latex` code fences for that reason. If
you edit it, don't introduce raw `$$ ... $$` blocks until `remark-math` +
`rehype-katex` are wired in.

### Tables look too big / "the padding change isn't taking effect"

The padding tokens live in `packages/docusaurus-theme/css/vars.css`
(`--ifm-table-cell-padding`, `--ifm-pre-padding`). Edit there. If the change
doesn't appear, restart the test-site dev server -- the `css/` folder
hot-reloads but a stuck Webpack cache can hide it for a few seconds.

### Sidebar is showing the old structure

`_category_.json` files control the category labels and sort order. If the
sidebar looks wrong:

- Make sure the file is named exactly `_category_.json` (note the leading and
  trailing underscores).
- Restart the dev server -- category JSON isn't always watched live.

### "Page not found" after moving a file

Cross-references that were relative to the old path still point at it.
Search the docs for the old filename and update the relative links. The test
site is configured with `onBrokenLinks: 'throw'` so broken links surface at
build time.

### "The workspace is in a weird state" (stale theme version, etc.)

Run `yarn reinstall` from the repo root. That wipes every `node_modules/` and
`yarn.lock`, then runs a fresh `yarn install`. Useful after:

- Bumping a Docusaurus major/minor (the lockfile pins the old version).
- Discovering yarn pulled a stale npm copy of a workspace package instead of
  symlinking the local one (a version-range mismatch between consumer and
  workspace).
- Any "deps drift" symptom where edits to a workspace source folder aren't
  visible in a consumer.

Takes ~30s; rebuilds native bindings.

## Building for production

```bash
yarn test-site:build
yarn workspace test-site serve   # serve the built output locally
```

The static output lands in `packages/test-site/build/`. Useful for verifying
that a change works in a real production bundle, not just dev mode.

## When to put something HERE vs. somewhere else

| Goal                                          | Goes in                                                |
|-----------------------------------------------|--------------------------------------------------------|
| Demonstrate a theme feature visually          | `packages/test-site/docs/<category>/<name>.mdx`        |
| Add or change a shared CSS rule               | `packages/docusaurus-theme/css/<file>.css`             |
| Add or change a shared component              | `packages/docusaurus-theme/src/components/<Name>/`      |
| Add a remark plugin used by docs plugins      | `packages/docusaurus-theme/src/docusaurus-plugins/`     |
| Configure the unified production site         | `unified-doc/docusaurus.config.ts` (not here)          |

If a sample page needs special CSS, add the CSS to the shared theme package
first and the sample on top of it. Test-site `custom.css` should only contain
test-site-specific tweaks (own brand colors, etc.).
