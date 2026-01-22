import React, { type ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  NetFoundryLayout,
  defaultNetFoundryFooterProps,
  defaultSocialProps,
} from '../../src/ui';
import type { ThemeConfigWithNetFoundry } from '../../src/options';

export interface LayoutProps {
  children: ReactNode;
  noFooter?: boolean;
  wrapperClassName?: string;
  title?: string;
  description?: string;
}

/**
 * NetFoundry theme Layout component.
 *
 * This component wraps NetFoundryLayout and reads configuration from
 * themeConfig.netfoundry in docusaurus.config.ts.
 *
 * To customize further, swizzle this component:
 * npx docusaurus swizzle @netfoundry/docusaurus-theme Layout --wrap
 */
export default function Layout({
  children,
  noFooter,
  wrapperClassName,
  title,
  description,
}: LayoutProps): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfigWithNetFoundry;
  const nfConfig = themeConfig.netfoundry ?? {};

  // Build footer props from config, falling back to defaults
  const footerProps = noFooter
    ? undefined
    : {
        ...defaultNetFoundryFooterProps(),
        ...nfConfig.footer,
        socialProps: {
          ...defaultSocialProps,
          ...nfConfig.footer?.socialProps,
        },
      };

  // Build star props if enabled
  const starProps =
    nfConfig.showStarBanner && nfConfig.starBanner
      ? {
          repoUrl: nfConfig.starBanner.repoUrl,
          label: nfConfig.starBanner.label,
        }
      : undefined;

  return (
    <NetFoundryLayout
      title={title}
      description={description}
      className={wrapperClassName}
      noFooter={noFooter}
      footerProps={footerProps}
      starProps={starProps}
      meta={{
        siteName: siteConfig.title,
      }}
    >
      {children}
    </NetFoundryLayout>
  );
}
