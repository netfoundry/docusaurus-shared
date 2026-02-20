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
 * A footer link: either a plain object with href/label, or an arbitrary ReactNode (JSX).
 */
export type FooterLinkItem = { href: string; label: string } | ReactNode;

/**
 * Footer configuration for the theme
 */
export interface FooterConfig {
  /** Description text shown in the footer */
  description?: string;
  /** Social media links */
  socialProps?: SocialProps;
  /** Documentation section links */
  documentationLinks?: FooterLinkItem[];
  /** Community section links */
  communityLinks?: FooterLinkItem[];
  /** Resources section links */
  resourceLinks?: FooterLinkItem[];
}

/**
 * Star banner configuration
 */
export interface StarBannerConfig {
  /** GitHub repository URL */
  repoUrl: string;
  /** Label text for the star button */
  label: string;
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
  /** Star banner configuration */
  starBanner?: StarBannerConfig;
  /** Whether to show the star banner (default: false) */
  showStarBanner?: boolean;
}

/**
 * Extended Docusaurus ThemeConfig with NetFoundry configuration
 */
export interface ThemeConfigWithNetFoundry {
  netfoundry?: NetFoundryThemeConfig;
  [key: string]: unknown;
}
