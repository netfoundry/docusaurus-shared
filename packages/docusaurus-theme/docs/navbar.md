# Navbar design notes

Design notes and hard-won gotchas for the NetFoundry theme navbar: sticky behavior, the logo, icon links, the product
icon, and the StarUs banner. Read this before changing navbar layout or app-shell CSS.

## Sticky navbar / app-shell height (the big one)

### The rule

**Never set `height: 100%` (or any fixed `height`) on `html`, `body`, or `#__docusaurus`.** Use `min-height: 100vh` on
`#__docusaurus` only. The shared theme does this in `css/layout.css`:

```css
html, body { width: 100%; }

#__docusaurus {
    width: 100%;
    min-height: 100vh;          /* NOT height: 100% */
    display: flex;
    flex-direction: column;
}
```

### Why

Docusaurus pins the navbar with `position: sticky` (via the `navbar--fixed-top` class infima styles as
`position: sticky; top: 0`). A sticky element only stays pinned while its **containing block** (its parent,
`#__docusaurus`) is on screen. If `#__docusaurus` is locked to `height: 100%` it is exactly one viewport tall while the
page content overflows past it, so the navbar's containing block is one screen high. Scroll one page and the navbar
scrolls away with its containing block. `min-height: 100vh` lets the shell grow to the full content height, so the
containing block spans the entire scroll and the navbar stays pinned. No `.navbar` override is needed.

`themeConfig.navbar.hideOnScroll` is unrelated -- it only toggles Docusaurus's own hide-on-scroll animation, which was
never the mechanism behind the "disappearing navbar".

### Consuming sites must not redeclare this

App-shell sizing belongs in the shared theme, not in each site's `custom.css`. Older sites copied a
`html, body, #__docusaurus { height: 100% }` block into their own `custom.css`; because `custom.css` loads after the
theme and `height` overrides `min-height` (different property), that copy silently re-breaks the sticky navbar no matter
what the theme says. If a downstream navbar is scrolling away, **grep the site's `custom.css` for `height: 100%` on
`#__docusaurus` and delete it.** This was the actual root cause found in `test-site` and `unified-doc`.

### How to verify (browser console)

```js
const d = document.getElementById('__docusaurus');
console.log(d.offsetHeight, document.body.scrollHeight);
```

`d.offsetHeight` should approximately equal `document.body.scrollHeight` (the shell is as tall as the document). If
`d.offsetHeight` is stuck at `window.innerHeight` while `scrollHeight` is much larger, the shell is capped -- something
is setting an explicit height on it.

### Debugging CSS changes in dev

Theme `css/**.css` hot-reloads live; the consuming site's `custom.css` hot-reloads too; theme `src/**` needs a rebuild.
When an edit seems to do nothing, confirm hot-reload actually fired before trusting the result -- a quick probe is a
temporary `body::after { content: "RELOADED #N"; position: fixed; top: 0; right: 0 }` with `#N` bumped per save. Stale
CSS will otherwise make A/B tests lie.

## Navbar logo

The brand logo height is set in the shared `css/layout.css`:

```css
.navbar__logo { height: 50px; }
```

Infima's default is `2rem` (32px), which renders the NetFoundry name-and-logo lockup too small; 50px is the intended
brand height. Make sure each site's `--ifm-navbar-height` is tall enough to give it breathing room (the test-site uses
60px). The logo image itself is set per site via `themeConfig.navbar.logo.src`.

## Icon links (`custom-iconLinks` / `navbarIconLinks`)

The right-hand social/icon row is a custom navbar item, `{ type: 'custom-iconLinks', position: 'right' }`, that renders
from `themeConfig.netfoundry.navbarIconLinks`:

```ts
navbarIconLinks: [
  { href: '...', title: 'Discourse', iconName: 'discourse' },                          // shows everywhere
  { href: '...', title: 'GitHub',    iconName: 'github', pathPrefixes: ['/docs/zrok'] }, // path-gated
]
```

- Supported `iconName`s: `discourse | github | reddit | x | youtube` (see `NavbarIconName` in `src/options.ts`).
- `pathPrefixes` gates an icon to specific doc trees (shown only when `pathname` starts with one of them). Omit it to
  show the icon on every page.
- If `navbarIconLinks` is absent entirely, the component falls back to a built-in `DEFAULT_ICON_LINKS` set (see
  `theme/NavbarItem/types/IconLinks/index.tsx`).
- Per-icon rendering quirks (mono->color fade, CSS-drawn circle, invert-on-hover, border ring) are driven by sets in
  that same `IconLinks` component, not by config.

## Product icon (between the logo and the first nav item)

Real product sites show their project logo between the NetFoundry logo and the first dropdown. There is no dedicated
navbar-item type for this; use a Docusaurus `type: 'html'` item placed first in `navbar.items`:

```ts
{
  type: 'html',
  position: 'left',
  value: '<a href="/" class="nf-navbar-product-icon" title="..."><img src="..." alt="..." /></a>',
}
```

Size it in CSS via the wrapper class (e.g. `.nf-navbar-product-icon img { height: 32px }`). In the test-site this is a
demo element, so its sizing lives in the test-site's `custom.css`, not the theme.

## StarUs banner

Configured via `themeConfig.netfoundry.starBanners`. Each entry shows when `pathname` starts with its `pathPrefix`
(omit `pathPrefix` to show everywhere); the first match wins (`theme/Layout/index.tsx`). The banner renders in normal
flow directly below the navbar (`NetFoundryLayout` order: Navbar -> StarUs -> main content), so with the sticky navbar
it scrolls away with the page while the navbar stays pinned. To pin it under the navbar instead would mean making
`.starUsRoot` sticky and coordinating `top` offsets so navbar + banner stack -- not currently done.

### Test-site caveat (breadcrumb)

The path-gated entries (`/docs/openziti`, `/docs/zrok`) never fire on the test-site because it has no pages under those
prefixes. Exercising the real path-gated behavior dynamically would require a doc tree under those prefixes -- in effect
a second test site -- which we deliberately don't maintain. So the test-site config carries one extra **demo-only
catch-all** `starBanners` entry (no `pathPrefix`) to force the banner to render. It is clearly commented in
`packages/test-site/docusaurus.config.ts`; to remove it, delete just that one line and keep the path-gated entries
(those are the production-style config).
