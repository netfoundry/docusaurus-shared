/**
 * Prism (code block) theme for docusaurus.config.ts `themeConfig.prism`.
 *
 * Intentionally minimal: it only maps the base foreground/background to the --code-fg /
 * --code-bg CSS variables. Every token color is driven by css/code.css (auto-loaded via
 * theme.css), so the whole syntax palette lives in CSS and hot-reloads with no server restart.
 * Light and dark palettes are selected in CSS via [data-theme], so the same object is used for
 * both `theme` and `darkTheme`.
 *
 * Usage:
 *   import {prismTheme} from '@netfoundry/docusaurus-theme/node';
 *   // ...
 *   prism: { theme: prismTheme, darkTheme: prismTheme, additionalLanguages: [...] }
 */
export const prismTheme = {
  plain: {
    color: 'var(--code-fg)',
    backgroundColor: 'var(--code-bg)',
  },
  styles: [] as Array<{types: string[]; style: Record<string, string>}>,
};

/**
 * Recommended Prism languages to load beyond the prism-react-renderer defaults
 * (typescript, yaml, json, markup, css, etc. are already bundled).
 *
 * `additionalLanguages` is a site-level themeConfig option, so each site must still
 * reference this in its own config. Keeping the list here makes it the single source of truth:
 *   prism: { theme: prismTheme, darkTheme: prismTheme, additionalLanguages: prismAdditionalLanguages }
 * Sites can spread and extend it: [...prismAdditionalLanguages, 'rust'].
 */
export const prismAdditionalLanguages = [
  'bash',
  'go',
  'python',
  'java',
  'csharp',
  'docker',
  'scala',
];
