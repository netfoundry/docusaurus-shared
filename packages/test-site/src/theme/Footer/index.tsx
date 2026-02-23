import React from 'react';
import { NetFoundryFooter, defaultNetFoundryFooterProps } from '@netfoundry/docusaurus-theme/ui';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * Local Footer override for test-site.
 * This ensures footer changes stay within the /test-site folder.
 */
export default function Footer() {
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as any;
  const nfConfig = themeConfig.netfoundry ?? {};

  // Build footer props
  const footerProps = {
    ...defaultNetFoundryFooterProps(),
    ...nfConfig.footer,
    // Apply specific label changes requested by user
    documentationLinks: [
      <a key="gs" href={useBaseUrl("/docs/learn/quickstarts/services/ztha")}>Get Started</a>,
      <a key="api" href={useBaseUrl("/docs/reference/developer/api/")}>API Reference</a>,
      <a key="sdk" href={useBaseUrl("/docs/reference/developer/sdk/")}>SDK Integration</a>,
    ],
    communityLinks: [
      <a key="gh" href="https://github.com/openziti/ziti">GitHub</a>,
      <a key="df" href="https://openziti.discourse.group/">Discourse Forum</a>,
      <a key="co" href={useBaseUrl("/docs/openziti/policies/CONTRIBUTING")}>Contribute</a>,
    ],
  };

  return <NetFoundryFooter {...footerProps} />;
}
