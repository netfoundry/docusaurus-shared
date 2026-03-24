import type { ReactNode } from 'react';

/**
 * Social media link configuration for the footer
 */
export interface SocialProps {
  githubUrl?: string;
  twitterUrl?: string;
  linkedInUrl?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

/**
 * Footer configuration for the theme
 */
export interface FooterConfig {
  /** Description text shown in the footer */
  description?: string;
  /** Social media links */
  socialProps?: SocialProps;
  /** Documentation section links (as ReactNode for JSX support) */
  documentationLinks?: ReactNode[];
  /** Community section links */
  communityLinks?: ReactNode[];
  /** Resources section links */
  resourceLinks?: ReactNode[];
}

/**
 * Star banner configuration
 */
export interface StarBannerConfig {
  /** GitHub repository URL */
  repoUrl: string;
  /** Label text for the star button */
  label: string;
  /** Only show banner when the current path starts with this prefix (e.g. '/docs/openziti') */
  pathPrefix?: string;
}

/**
 * A single link entry in the product picker
 */
export interface ProductPickerLink {
  /** Display name */
  label: string;
  /** Route or URL */
  to: string;
  /** Logo shown in light mode (and dark mode if logoDark is absent) */
  logo?: string;
  /** Logo shown only in dark mode */
  logoDark?: string;
  /** Short description shown beneath the label */
  description?: string;
}

/**
 * A column in the product picker dropdown.
 * Header color is assigned automatically by column index (primary → secondary → tertiary).
 */
export interface ProductPickerColumn {
  /** Column heading text */
  header: string;
  links: ProductPickerLink[];
}

/**
 * Options passed to the theme plugin in docusaurus.config.ts
 *
 * @example
 * ```ts
 * themes: [
 *   ['@netfoundry/docusaurus-theme', {
 *     customCss: require.resolve('./src/css/custom.css'),
 *   }],
 * ],
 * ```
 */
export interface NetFoundryThemeOptions {
  /** Custom CSS file path(s) to include */
  customCss?: string | string[];
}

/**
 * Theme configuration in themeConfig.netfoundry
 *
 * @example
 * ```ts
 * themeConfig: {
 *   netfoundry: {
 *     footer: {
 *       description: 'My site description',
 *       socialProps: {
 *         githubUrl: 'https://github.com/my-org/repo',
 *       },
 *     },
 *     starBanner: {
 *       repoUrl: 'https://github.com/my-org/repo',
 *       label: 'Star us on GitHub',
 *     },
 *     showStarBanner: true,
 *   },
 * },
 * ```
 */
export interface NetFoundryThemeConfig {
  /** Footer configuration */
  footer?: FooterConfig;
  /** Path-aware star banners — each entry shows only when the current path starts with pathPrefix (omit pathPrefix to show everywhere) */
  starBanners?: StarBannerConfig[];
  /** Product picker columns. If omitted, the theme falls back to built-in NetFoundry defaults. */
  productPickerColumns?: ProductPickerColumn[];
  /** Logo URL for the NetFoundry Console link in the product picker (overrides the default NetFoundry branding icon) */
  consoleLogo?: string;
}

/**
 * Extended Docusaurus ThemeConfig with NetFoundry configuration
 */
export interface ThemeConfigWithNetFoundry {
  netfoundry?: NetFoundryThemeConfig;
  [key: string]: unknown;
}
