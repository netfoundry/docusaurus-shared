import type {PluginConfig} from '@docusaurus/types';

/**
 * Redirects for unified-doc's own pages (src/pages), as opposed to the per-product redirects that
 * live with each remote in _remotes/.
 *
 * Renaming or removing a page under src/pages drops its path out of the sitemap, and
 * scripts/check-sitemap-drift.mjs fails the build until a redirect covers it. Add the old path
 * here rather than reinstating the page.
 *
 * `routeBase` is 'docs/<name>' on Vercel previews and '<name>' elsewhere, so callers pass the
 * prefix through the config's routeBase() helper to keep both builds consistent.
 */
/** Pages that changed name, as [old, current]. Bare page names — routeBase supplies the prefix. */
const RENAMED: [from: string, to: string][] = [
    // ['what-is-netfoundry', 'netfoundry-platform-overview'],
];

export function redirects(routeBase: (name: string) => string): PluginConfig {
    const path = (name: string) => '/' + routeBase(name);

    return [
        '@docusaurus/plugin-client-redirects',
        {
            id: 'unified-doc-redirects',
            redirects: RENAMED.map(([from, to]) => ({from: path(from), to: path(to)})),
        },
    ];
}
