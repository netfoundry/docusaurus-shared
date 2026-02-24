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
